"""
Lightweight Proxy REST API (University Rubric Demo)
---------------------------------------------------
Purpose:
  - Demonstrate REST endpoints independent of the real Google Apps Script backend.
  - Do NOT alter production flow (HTML/JS still posts directly to GAS).
  - In-memory store only (clears on restart).

Endpoints:
  GET  /api/orders             -> list all captured proxy orders
  POST /api/orders             -> accept booking-form JSON payload
  GET  /api/orders/<id>        -> retrieve single order by generated id
  PUT  /api/orders/<id>        -> update an existing order (partial)
  GET  /api/kpis               -> simple derived metrics

Run locally:
  python api.py

Deploy (Render/Railway):
  - Set PYTHON_VERSION if needed.
  - Gunicorn example: gunicorn api:app --bind 0.0.0.0:$PORT

Field mapping (expected keys from your booking form):
  first_name, surname, club_school, contact_number, contact_email,
  payment_option, costing, colour OR colour_selection,
  logo_image (base64 data URL or raw base64), additional_notes

CORS enabled so you can test with fetch/curl. Does NOT forward to Google Apps Script.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import time
import base64
import re

app = Flask(__name__)
CORS(app)  # Allow all origins for demo; tighten in production if needed.

# In-memory store (clears on process restart)
ORDERS = []
# Simple auto-increment surrogate id
_order_counter = 0

# Required base fields (colour can arrive as 'colour' or 'colour_selection')
REQUIRED_FIELDS = [
    "first_name", "surname", "club_school",
    "contact_number", "contact_email",
    "payment_option", "costing"
]

OPTIONAL_FIELDS = [
    "colour", "colour_selection",
    "logo_image", "additional_notes"
]

PHONE_RE = re.compile(r'^(?:0|\+27)[1-9][0-9]{8}$', re.ASCII)
EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', re.ASCII)


def next_order_id() -> str:
    """Generate a simple incremental ID like PX01, PX02."""
    global _order_counter
    _order_counter += 1
    return f"PX{_order_counter:02d}"


def validate_payload(payload: dict):
    """
    Basic validation:
      - Required fields present
      - Phone format (SA)
      - Email format
      - logo_image (if present) is plausibly base64 / data URL (len check only)
    Returns (ok, errors:list[str])
    """
    errors = []

    # Required fields
    for f in REQUIRED_FIELDS:
        if not payload.get(f):
            errors.append(f"Missing required field: {f}")

    # Phone
    phone = payload.get("contact_number", "")
    if phone and not PHONE_RE.match(phone):
        errors.append("Invalid contact_number format (expect 0XXXXXXXXX or +27XXXXXXXXX).")

    # Email
    email = payload.get("contact_email", "")
    if email and not EMAIL_RE.match(email):
        errors.append("Invalid contact_email format.")

    # Logo image (optional)
    logo = payload.get("logo_image") or ""
    if logo:
        # Accept data URLs or pure base64 (just do length sanity check)
        if logo.startswith("data:"):
            if "," not in logo:
                errors.append("logo_image data URL malformed.")
        else:
            # Check base64 decodability in a lightweight way
            try:
                # Strip possible whitespace
                base64.b64decode(logo.strip()[:200], validate=True)
            except Exception:
                errors.append("logo_image not valid base64 (first 200 chars failed).")

    return (len(errors) == 0, errors)


@app.get("/api/orders")
def list_orders():
    """
    Return all stored orders (proxy only).
    """
    return jsonify({
        "status": "ok",
        "count": len(ORDERS),
        "orders": ORDERS
    }), 200


@app.post("/api/orders")
def create_order():
    """
    Accept booking-form style JSON.
    Does NOT forward to Google Apps Script.
    Stores order in memory and returns generated id.
    """
    if not request.is_json:
        return jsonify({"status": "error", "message": "Content-Type must be application/json"}), 415

    payload = request.get_json() or {}
    ok, errors = validate_payload(payload)
    if not ok:
        return jsonify({"status": "error", "errors": errors}), 400

    # Normalize colour (prefer 'colour' over 'colour_selection')
    colour = payload.get("colour") or payload.get("colour_selection") or ""
    order_id = next_order_id()
    ts = int(time.time())

    order_record = {
        "id": order_id,
        "timestamp": ts,
        "first_name": payload.get("first_name", "").strip(),
        "surname": payload.get("surname", "").strip(),
        "club_school": payload.get("club_school", "").strip(),
        "contact_number": payload.get("contact_number", "").strip(),
        "contact_email": payload.get("contact_email", "").strip(),
        "payment_option": payload.get("payment_option", "").strip(),
        "costing": payload.get("costing", "").strip(),
        "colour": colour.strip(),
        "additional_notes": payload.get("additional_notes", "").strip(),
        # For brevity do not store full base64 if gigantic; truncate safely for demo.
        "logo_image_truncated": (payload.get("logo_image") or "")[:120] + ("…" if payload.get("logo_image") and len(payload.get("logo_image")) > 120 else "")
    }

    ORDERS.append(order_record)

    return jsonify({
        "status": "success",
        "id": order_id,
        "stored_fields": list(order_record.keys()),
        "message": "Order captured in proxy (not forwarded)."
    }), 201


@app.get("/api/orders/<order_id>")
def get_order(order_id):
    """
    Return a single order or 404.
    """
    for o in ORDERS:
        if o["id"] == order_id:
            return jsonify({"status": "ok", "order": o}), 200
    return jsonify({"status": "error", "message": f"Order {order_id} not found"}), 404


@app.put("/api/orders/<order_id>")
def update_order(order_id):
    """
    Partial update: any provided field overwrites existing.
    Validation applied only to changed required fields; empty string allowed to clear optional fields.
    """
    if not request.is_json:
        return jsonify({"status": "error", "message": "Content-Type must be application/json"}), 415

    payload = request.get_json() or {}
    for idx, o in enumerate(ORDERS):
        if o["id"] == order_id:
            # Apply updates
            changed = {}
            for key in REQUIRED_FIELDS + OPTIONAL_FIELDS:
                if key in payload:
                    # Special: colour normalization
                    if key in ("colour", "colour_selection"):
                        new_colour = payload.get("colour") or payload.get("colour_selection") or ""
                        o["colour"] = new_colour.strip()
                        changed["colour"] = o["colour"]
                    elif key == "logo_image":
                        # Store truncated preview
                        trunc = payload["logo_image"][:120] + ("…" if len(payload["logo_image"]) > 120 else "")
                        o["logo_image_truncated"] = trunc
                        changed["logo_image_truncated"] = trunc
                    else:
                        o[key] = (payload[key] or "").strip()
                        changed[key] = o[key]

            # Re-validate critical fields if changed
            ok, errors = validate_payload({
                **{f: o.get(f) for f in REQUIRED_FIELDS},
                "contact_number": o.get("contact_number"),
                "contact_email": o.get("contact_email"),
                "logo_image": payload.get("logo_image", "")
            })
            if not ok:
                return jsonify({"status": "error", "errors": errors}), 400

            ORDERS[idx] = o
            return jsonify({"status": "success", "id": order_id, "updated": changed}), 200

    return jsonify({"status": "error", "message": f"Order {order_id} not found"}), 404


@app.get("/api/kpis")
def get_kpis():
    """
    Simple derived metrics for demo (not tied to real sheet).
    """
    total = len(ORDERS)
    # Example: count by costing
    costing_counts = {}
    for o in ORDERS:
        c = o.get("costing") or "Unknown"
        costing_counts[c] = costing_counts.get(c, 0) + 1

    return jsonify({
        "status": "ok",
        "total_orders": total,
        "distinct_costing_types": len(costing_counts),
        "costing_breakdown": costing_counts,
        "example_popular_costing": max(costing_counts, key=costing_counts.get) if costing_counts else None
    }), 200


# Health endpoint (optional quick check) – not required by rubric but handy
@app.get("/health")
def health():
    return jsonify({"status": "ok", "orders_cached": len(ORDERS)}), 200


@app.get("/")
def root():
    return {"status": "ok", "message": "Proxy API running", "endpoints": [
        "/api/orders", "/api/orders/<id>", "/api/kpis"
    ]}


if __name__ == "__main__":
    # debug=True for local development; disable in deployment
    app.run(host="0.0.0.0", port=5000, debug=True)
