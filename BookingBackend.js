const scriptURL = "https://script.google.com/macros/s/AKfycbwv1dL9_IkeTe2e1nLqTbVlcwAxsEGzx2_sJOk_VuONi4kgxgA08tZQQil6MmqBMxuKiA/exec";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("snugfit-booking-form");
  if (!form) return;

  const phoneEl = document.getElementById("contact_number");
  const isValidPhone = v => /^(?:0|\+27)[1-9][0-9]{8}$/.test((v||"").trim());


  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!isValidPhone(phoneEl?.value)) {
      alert("Enter SA number: 0XXXXXXXXX or +27XXXXXXXXX");
      phoneEl?.focus();
      return;
    }

    // Enable any disabled controls so we can read their values
    document.querySelectorAll("[disabled], fieldset[disabled]").forEach(el => el.disabled = false);

    // Ensure logo_image is a data URL
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

    // Read from form OR document (handles fields placed outside the form)
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

    const fd = new FormData();
    fd.append("first_name",       readValue("first_name", ["#first_name"]));
    fd.append("surname",          readValue("surname", ["#surname"]));
    fd.append("club_school",      readValue("club_school", ["#club_school"]));
    fd.append("contact_number",   readValue("contact_number", ["#contact_number"]));
    fd.append("contact_email",    readValue("contact_email", ["#contact_email"]));
    fd.append("payment_option",   readValue("payment_option"));
    fd.append("costing",          readValue("costing"));
    // Support either name="colour" or name="colour_selection" or id="colour_select"
    let colour = readValue("colour", ["#colour_select"]);
    if (!colour) colour = readValue("colour_selection");
    fd.append("colour", colour);
    fd.append("additional_notes", readValue("additional_notes", ["#additional_notes"]));
    fd.append("logo_image",       logoHidden?.value || "");
    // Optional: include what was chosen in logo_select
    const logoSelectVal = readValue("logo_select", ["#logo_select"]);
    if (logoSelectVal) fd.append("logo_select", logoSelectVal);

    // Debug: print keys/values clearly
    console.group("FINAL FormData");
    for (const [k, v] of fd.entries()) console.log(k, typeof v === "string" ? (v.slice(0,60) + (v.length>60 ? "…":"")) : v);
    console.groupEnd();

    try {
      // Show loading overlay just before sending
      if (window.showFormLoading) window.showFormLoading();

      // Send as FormData; keep current behavior
      await fetch(scriptURL, { method: "POST", body: fd, redirect: "follow", credentials: "omit" });

      // Navigation will replace the page (overlay goes away naturally)
      window.location.href = "ThankYou.html";
    } catch (err) {
      // Hide on error and notify
      if (window.hideFormLoading) window.hideFormLoading();
      alert("Error submitting form: " + err);
    }
  });
});
