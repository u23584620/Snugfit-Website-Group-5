
// LINKING TO GOOGLE APPS SCRIPT BACKEND (WEB APP URL)
const scriptURL = "https://script.google.com/macros/s/AKfycbwv1dL9_IkeTe2e1nLqTbVlcwAxsEGzx2_sJOk_VuONi4kgxgA08tZQQil6MmqBMxuKiA/exec";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("snugfit-booking-form");
  if (!form) return;

  const phoneEl = document.getElementById("contact_number");
  const isValidPhone = v => /^(?:0|\+27)[1-9][0-9]{8}$/.test((v||"").trim());

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    // BASIC PHONE NUMBER VALIDATION CHECK OTHERWISE ALERT AND FOCUS
    if (!isValidPhone(phoneEl?.value)) {
      alert("Enter SA number: 0XXXXXXXXX or +27XXXXXXXXX");
      phoneEl?.focus();
      return;
    }

    // ENABLE ANY DISABLED FIELDS TO READ THEIR DEFAULT VALUES FOR SUBMISSION
    document.querySelectorAll("[disabled], fieldset[disabled]").forEach(el => el.disabled = false);

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
    
    const logoSelectVal = readValue("logo_select", ["#logo_select"]);
    if (logoSelectVal) fd.append("logo_select", logoSelectVal);

    // DEBUGGING: LOG FINAL FormData KEYS/VALUES CLEARLY ON CONSOLE
    console.group("FINAL FormData");
    for (const [k, v] of fd.entries()) console.log(k, typeof v === "string" ? (v.slice(0,60) + (v.length>60 ? "…":"")) : v);
    console.groupEnd();

    try {
      // LOADING/FORM SUBMISSION OVERLAY SHOW
      if (window.showFormLoading) window.showFormLoading();

      // SEND AS FORMDATA (keep current behaviour) to BACKEND API/WEB APP
      await fetch(scriptURL, { method: "POST", body: fd, redirect: "follow", credentials: "omit" });

      // DIRECTED TO THANK YOU PAGE ON FORM SUBMISSION SUCCESS
      window.location.href = "ThankYou.html";
    } catch (err) {
      // IF SUBMISSION ERROR, HIDE LOADING OVERLAY AND ALERT ERROR
      if (window.hideFormLoading) window.hideFormLoading();
      alert("Error submitting form: " + err);
    }
  });
});
