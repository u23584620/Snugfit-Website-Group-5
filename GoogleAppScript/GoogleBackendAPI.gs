function doPost(e) {
  try {
    // ---------- CONFIG ----------
    var SPREADSHEET_ID   = "1CBs1X0cbDWphWTv7IzIriT16uDOZ0-vrXdk0aVnJY-M";
    var SHEET_NAME       = "A00";
    var DRIVE_FOLDER_ID  = "1V0sGiBHhb6XiBxmyp3zy34hkz9cqGo5i";
    var HEADER_ROW       = 1;
    var IMP_COL          = 1;
    var EMAIL_STATUS_COL = 15; // column O
    // ----------------------------

    var data = {};

    if (e && e.postData && typeof e.postData.contents === "string") {
      try { data = JSON.parse(e.postData.contents) || {}; } catch (_) {}
    }
    if (e && e.parameter) {
      Object.keys(e.parameter).forEach(function(k){
        if (data[k] === undefined || data[k] === "") data[k] = e.parameter[k];
      });
    }

    var first_name       = (data.first_name || "").trim();
    var surname          = data.surname || "";
    var club_school      = data.club_school || "";
    var contact_number   = data.contact_number || "";
    var contact_email    = data.contact_email || "";
    var payment_option   = data.payment_option || "";
    var costing          = data.costing || "";
    var colour_selection = data.colour || data.colour_selection || "";
    var base64Image      = data.logo_image || data.image || "";
    var additional_notes = data.additional_notes || "";

    // Format contact number for South Africa
    if (/^\+27\d{9}$/.test(contact_number)) {
      contact_number = "0" + contact_number.slice(3, 5) + " " + contact_number.slice(5, 8) + " " + contact_number.slice(8);
    }

    var basePrices = {
      "MG Standard": 800,
      "Ortho (T&B)": 980,
      "Ortho (T)": 850,
      "Rubberised": 980,
      "Retainer": 1600,
      "Bleaching": 1600
    };
    var extraColours = ["Silver (+ R180)", "Gold (+ R180)", "Dual Colour (+ R180)", "Tri-Colour (+ R180)"];
    var basePrice = basePrices[costing] || 0;
    var colourSurcharge = extraColours.indexOf(colour_selection) !== -1 ? 180 : 0;
    var totalPrice = basePrice + colourSurcharge;

    var dateToday = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy/MM/dd");

    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error("Sheet tab '" + SHEET_NAME + "' not found");

    var lock = LockService.getScriptLock();
    lock.waitLock(10000);

    var impression = "";
    var appendRow = 0;
    var publicImageURL = ""; // uploaded logo URL
    try {
      // --- generate next impression number ---
      var lastRow = sheet.getLastRow();
      var lastImpression = 0;
      if (lastRow > HEADER_ROW) {
        var values = sheet.getRange(HEADER_ROW + 1, IMP_COL, lastRow - HEADER_ROW, 1).getValues();
        for (var i = 0; i < values.length; i++) {
          var val = String(values[i][0]).trim();
          var m = val.match(/^A0*([0-9]+)$/i);
          if (m) {
            var num = parseInt(m[1], 10);
            if (!isNaN(num) && num > lastImpression) lastImpression = num;
          }
        }
      }
      impression = "A" + ("00" + (lastImpression + 1)).slice(-2);

      // --- Save image to Drive if provided ---
      if (base64Image) {
        try {
          var rawBase64 = (String(base64Image).indexOf("data:") === 0) ? base64Image.split(",")[1] : base64Image;
          var contentType = rawBase64.slice(0,4) === "/9j/" ? "image/jpeg" : "image/png";
          var ext = (contentType === "image/jpeg") ? ".jpg" : ".png";
          var safeFirstName = first_name.replace(/[^a-z0-9_-]/gi,"");
          var fileName = impression + "_" + (safeFirstName || "logo") + ext;
          var blob = Utilities.newBlob(Utilities.base64Decode(rawBase64), contentType, fileName);
          var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
          var file = folder.createFile(blob);
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          publicImageURL = "https://drive.google.com/uc?export=view&id=" + file.getId();
        } catch (imgErr) { Logger.log("Failed saving image: " + imgErr); }
      }

      // --- Create new row ---
      var newRow = [
        impression,        // 1
        first_name,        // 2
        surname,           // 3
        club_school,       // 4
        dateToday,         // 5
        contact_number,    // 6
        contact_email,     // 7
        totalPrice,        // 8
        payment_option,    // 9
        "Not Paid",        // 10
        costing,           // 11
        colour_selection,  // 12
        publicImageURL,    // 13 = Chosen Logo URL
        additional_notes,  // 14
        ""                 // 15 = Email Status
      ];

      appendRow = sheet.getLastRow() + 1;
      sheet.getRange(appendRow, 1, 1, newRow.length).setValues([newRow]);

      // --- FORMATTING ---
      sheet.getRange(appendRow, 8).setNumberFormat('"R"#,##0.00');
      sheet.getRange(appendRow, 5).setNumberFormat("yyyy/mm/dd");
      sheet.getRange(appendRow, 6).setNumberFormat("@");
      sheet.getRange(appendRow, 11).setNumberFormat("@");
      sheet.getRange(appendRow, 14).setWrap(true);

      sheet.getRange(appendRow, 10).setDataValidation(
        SpreadsheetApp.newDataValidation().requireValueInList(["Not Paid","Paid"], true).setAllowInvalid(false).build()
      );

      // --- Conditional formatting ---
      var statusColumnRange = sheet.getRange(HEADER_ROW + 1, 10, sheet.getMaxRows() - HEADER_ROW);
      var rules = sheet.getConditionalFormatRules();
      rules = rules.filter(function(r){
        var ranges = r.getRanges();
        return !(ranges.length === 1 && ranges[0].getColumn() === 10);
      });
      rules.push(
        SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("Not Paid").setBackground("#f28b82").setRanges([statusColumnRange]).build(),
        SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("Paid").setBackground("#81c995").setRanges([statusColumnRange]).build()
      );
      sheet.setConditionalFormatRules(rules);

      // --- EMAIL INTEGRATION ---
      if (contact_email) {
        var headerLogoUrl = "https://drive.google.com/uc?export=view&id=1ECDgOMuBv7Hwx-qFYe3c7DY5vzWj2yOd"; // fixed header logo

        var htmlBodyCustomer = `
          <div style="font-family: Arial, sans-serif; color: #000000; background-color: #ffffff; padding: 20px; border-radius: 8px;">
            <div style="text-align:center; border-bottom: 3px solid #d4af37; padding-bottom: 15px; margin-bottom: 20px;">
              <img src="${headerLogoUrl}" alt="SnugFit Mouthguards" style="contain">
            </div>

            <p style="font-size: 16px; color: #1a237e;">
              Thank you, <strong>${first_name} ${surname}</strong>, for your order.
            </p>

            <p style="font-size: 14px; color: #000000;">
              Your impression number is <span style="font-weight: bold; color: #1a237e;">${impression}</span>.
            </p>

            <p style="font-size: 14px; color: #000000;"><strong>Product ID:</strong> ${costing}</p>
            <p style="font-size: 14px; color: #000000;"><strong>Product Colour:</strong> ${colour_selection}</p>
            <p style="font-size: 14px; color: #000000;"><strong>Chosen Logo:</strong> ${publicImageURL || "No logo uploaded"}</p>
            <p style="font-size: 14px; color: #000000;"><strong>Additional Info:</strong> ${additional_notes}</p>
            <p style="font-size: 14px; color: #000000;"><strong>Total Amount Due:</strong> R${totalPrice}</p>
            <p style="font-size: 14px; color: #000000;"><strong>Payment Method:</strong> ${payment_option}</p>

            <p style="font-size: 14px; color: #000000;">Please contact us to make a booking for your impression:</strong></p>
            <p style="font-size: 14px; color: #000000;"><strong>Primary Contact Number:</strong> 083 215 9515</p>
            <p style="font-size: 14px; color: #000000;"><strong>Secondary Contact Number:</strong> 083 251 7031</p>

            <p style="margin-top: 30px; font-size: 14px; color: #000000;">
              Kind regards,<br>
              <strong>The SnugFit Mouthguards Team</strong><br>
              <a href="https://snugfitmouthguards.co.za" style="color: #0057b8; text-decoration: none;">
                snugfitmouthguards.com
              </a>
            </p>

            <p style="font-size: 12px; color: #1a1a1a;">
              Note for marker: This domain is linked to the current (old) website, but will be used for the improved website (the one I designed) when launched.
            </p>
          </div>
        `;


        var htmlBodyBusiness = `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>New Order Submission</h2>
            <p><strong>First Name:</strong> ${first_name}</p>
            <p><strong>Surname:</strong> ${surname}</p>
            <p><strong>Contact Number: </strong> ${contact_number}</p>
            <p><strong>Email:</strong> ${contact_email}</p>
            <p><strong>Product ID:</strong> ${costing}</p>
            <p><strong>Product Colour:</strong> ${colour_selection}</p>
            <p><strong>Chosen Logo:</strong> ${publicImageURL || "No logo uploaded"}</p>
            <p><strong>Total Amount Due:</strong> R${totalPrice}</p>
            <p><strong>Payment Method:</strong> ${payment_option}</p>
            <p><strong>Impression Number:</strong> ${impression}</p>
            <p><strong>Additional Info:</strong> ${additional_notes}</p>
            <p>Check the Google Sheet for full details.</p>
          </div>
        `;

        MailApp.sendEmail({
          to: contact_email,
          subject: "Your SnugFit Order Confirmation",
          htmlBody: htmlBodyCustomer
        });

        MailApp.sendEmail({
          to: "Adrianmackzie@gmail.com",
          subject: "New Order Submission",
          htmlBody: htmlBodyBusiness
        });

        // Mark email as sent
        sheet.getRange(appendRow, EMAIL_STATUS_COL).setValue("SENT");
      }

    } finally {
      lock.releaseLock();
    }

    return ContentService
      .createTextOutput(JSON.stringify({ 
        status:"success", 
        impression: impression, 
        row: appendRow, 
        total_price: totalPrice,
        date: dateToday,
        image_url: publicImageURL 
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log("Error in doPost: " + err);
    return ContentService.createTextOutput(JSON.stringify({ status:"error", message:String(err) }))
                        .setMimeType(ContentService.MimeType.JSON);
  }
}
