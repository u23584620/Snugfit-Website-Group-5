// GOOGLE APPS SCRIPT BACKEND LINK FOR GOOGLE SHEETS  (WEB APP URL)
const scriptURL = "https://script.google.com/macros/s/AKfycbzLjrk2n1qTPpurt3tHZW9C6hwgLKQUJN6fsPQN6I7R4em8DeNUZAvpONiUjtYQhyyvaw/exec"
// PROXY URL FOR FLASK BACKEND API FOR STORING AND GETTING ORDERS
const proxyURL = "https://snugfit-website-group-5.onrender.com/api/orders";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("snugfit-booking-form");
  if (!form) return;

  const phoneEl = document.getElementById("contact_number");
  const isValidPhone = v => /^(?:0|\+27)[1-9][0-9]{8}$/.test((v||"").trim());

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    // BASIC PHONE NUMBER VALIDATION CHECK WITH ALERT AND FOCUS
    if (!isValidPhone(phoneEl?.value)) {
      alert("Enter SA number: 0XXXXXXXXX or +27XXXXXXXXX");
      phoneEl?.focus();
      return;
    }

    // REQUIRE ORDER CONFIRMATION CHECKBOX BEFORE SUBMISSION
    const confirmEl = document.getElementById("confirm_order");
    if (!confirmEl || !confirmEl.checked) {
      alert("Please confirm your order details to proceed.");
      confirmEl?.focus();
      return;
    }

    // HONOUR BUILT-IN REQUIRED/PATTERN CONSTRAINTS ACROSS THE FORM
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // ENABLE ANY DISABLED FIELDS TO READ THEIR DEFAULT VALUES FOR SUBMISSION
    document.querySelectorAll("[disabled], fieldset[disabled]").forEach(el => el.disabled = false);

    // IF "Custom Text Upload" SELECTED BUT NO IMAGE SAVED, GENERATE IT FROM CURRENT FIELDS
    try {
      const logoSelectEl = document.getElementById("logo_select");
      const logoHidden = document.getElementById("logo_image");
      if (logoSelectEl?.value === "Custom Text Upload" && logoHidden && !logoHidden.value) {
        const textEl = document.getElementById("custom-text-input");
        const colorEl = document.getElementById("custom-text-color");
        const bgEl    = document.getElementById("custom-bg-color");
        const fontEl  = document.getElementById("custom-text-font");
        const text = (textEl?.value || "").trim();
        if (text) {
          const canvas = document.createElement('canvas');
          canvas.width = 200; canvas.height = 75;
          const ctx = canvas.getContext('2d');
          // Background
          ctx.fillStyle = (bgEl?.value || "#ffffff");
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          // Font sizing (match page logic for Goudy Stout)
          let fontSize = 30;
          const fontFamily = (fontEl?.value || "Poppins, Arial, sans-serif");
          if (fontFamily.includes("Goudy Stout")) fontSize = 24;
          ctx.font = `bold ${fontSize}px ${fontFamily}`;
          ctx.fillStyle = (colorEl?.value || "#111111");
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(text, canvas.width / 2, canvas.height / 2);
          logoHidden.value = canvas.toDataURL("image/png");
        }
      }
    } catch {}

    // ENSURING LOGO_IMAGE IS A DATA URL FOR SUBMISSION
    const logoHidden = document.getElementById("logo_image");
    if (logoHidden && logoHidden.value && !logoHidden.value.startsWith("data:")) {
      try {
        const resp = await fetch(logoHidden.value);
        const blob = await resp.blob();
        const fr = new FileReader();
        const dataURL = await new Promise((res, rej) => { fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(blob); });
        logoHidden.value = dataURL;
      } catch {}
    }

    // READS ALL REQUIRED FIELDS AND CREATES FORMDATA PACKAGE
    const readValue = (name, fallbacks = []) => {
      const sel = `[name="${name}"]`;
      const checked = form.querySelector(`${sel}:checked`) || document.querySelector(`${sel}:checked`);
      if (checked) return checked.value || "";
      const byName = form.querySelector(sel) || document.querySelector(sel);
      if (byName) return byName.value || "";
      for (const f of fallbacks) {
        const el = document.querySelector(f);
        if (el) return el.value || "";
      }
      return "";
    };
    // CONSTRUCT FORMDATA OR PAYLOAD FOR SUBMISSION TO BACKEND API
    const fd = new FormData();
    fd.append("first_name",       readValue("first_name", ["#first_name"]));
    fd.append("surname",          readValue("surname", ["#surname"]));
    fd.append("club_school",      readValue("club_school", ["#club_school"]));
    fd.append("contact_number",   readValue("contact_number", ["#contact_number"]));
    fd.append("contact_email",    readValue("contact_email", ["#contact_email"]));
    fd.append("payment_option",   readValue("payment_option"));
    fd.append("costing",          readValue("costing"));
    // Supports either name="colour" or name="colour_selection" or id="colour_select" to avoid id mismatches
    let colour = readValue("colour", ["#colour_select"]);
    if (!colour) colour = readValue("colour_selection");
    fd.append("colour", colour);
    fd.append("additional_notes", readValue("additional_notes", ["#additional_notes"]));
    fd.append("logo_image",       logoHidden?.value || "");
    fd.append("final_cost",       readValue("final_cost", ["#final_cost"]));
    
    const logoSelectVal = readValue("logo_select", ["#logo_select"]);
    if (logoSelectVal) fd.append("logo_select", logoSelectVal);

    // DEBUGGING
    console.group("FINAL FormData");
    for (const [k, v] of fd.entries()) console.log(k, typeof v === "string" ? (v.slice(0,60) + (v.length>60 ? "…":"")) : v);
    console.groupEnd();

    // REAL PRODUCTION SUBMISSION: send to Google first; fire-and-forget proxy
    async function submitBoth(fd){
      // 1) Send to Google Apps Script (await this; it's the source of the impression number)
      const gasResp = await fetch(scriptURL, { method: "POST", body: fd });

      let impressionNumber = null;
      try {
        const gasData = await gasResp.json();
        impressionNumber = gasData.impression || null;
        console.log("Impression from GAS:", impressionNumber);
        if (impressionNumber) localStorage.setItem("impressionNumber", impressionNumber);
      } catch (e){
        console.warn("Could not parse GAS response JSON:", e);
      }

      // 2) Build proxy payload
      const payload = {
        id: impressionNumber,
        impression: impressionNumber,
        first_name: fd.get("first_name"),
        surname: fd.get("surname"),
        club_school: fd.get("club_school"),
        contact_number: fd.get("contact_number"),
        contact_email: fd.get("contact_email"),
        payment_option: fd.get("payment_option"),
        costing: fd.get("costing"),
        colour: fd.get("colour") || fd.get("colour_selection") || "",
        // NOTE: large data URLs can slow down or exceed keepalive limits; include only if needed
        logo_image: fd.get("logo_image"),
        additional_notes: fd.get("additional_notes"),
        final_cost: parseInt(fd.get("final_cost")) || 0
      };

      // 3) Fire-and-forget to proxy so UI can proceed immediately
      try {
        const jsonBlob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        const sent = navigator.sendBeacon ? navigator.sendBeacon(proxyURL, jsonBlob) : false;
        if (!sent) {
          fetch(proxyURL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), keepalive: true })
            .catch(err => console.warn('Proxy keepalive error:', err));
        }
      } catch (e) {
        console.warn('Proxy beacon error:', e);
      }

      return { gasOk: gasResp.ok, proxyId: null, impressionNumber };
    }

    try {
      // LOADING/FORM SUBMISSION OVERLAY
      if (window.showFormLoading) window.showFormLoading();

      // SEND AS FORMDATA TO BACKEND API/WEB APP
      const result = await submitBoth(fd);

      // STORING FORM RESPONSE DATA NEED FOR THANK YOU PAGE IN LOCALSTORAGE
      localStorage.setItem("first_name", fd.get("first_name") || "");
      localStorage.setItem("contact_email", fd.get("contact_email") || "");
      if(result.impressionNumber) localStorage.setItem("impressionNumber", result.impressionNumber);

      // SHOWING PROXY ID TO LECTURER FOR MARKING PURPOSES
      if(result.proxyId){
        localStorage.setItem("proxyOrderId", result.proxyId);
      }

      // DIRECTED TO THANK YOU PAGE UPON SUCCESS OF FORM SUBMISSION
      window.location.href = "ThankYou.html";
    } catch (err) {
      // IF SUBMISSION ERROR, HIDE LOADING OVERLAY AND ALERT ERROR
      if (window.hideFormLoading) window.hideFormLoading();
      alert("Error submitting form: " + err);
    }
  });
});
