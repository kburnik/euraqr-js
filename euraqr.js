/**
 * Generate QR codes for invoices in Croatia (e-URA).
 */

/*
 * Handles Generating QR codes for invoices based on e-Ura.
 * (http://www.e-ura.hr/).
 */
var EuraQr = function() {
  var fields = {
    /*  3 */ "merchant_name": {required: false, type: 'string', default_value: ""},
    /*  4 */ "merchant_oib": {required: true, type: 'string', default_value: ""},
    /*  5 */ "merchant_iban": {required: false, type: 'string', default_value: ""},
    /*  6 */ "reference_number": {required: false, type: 'string', default_value: ""},
    /*  7 */ "vat_mode": {required: true, type: 'enum', values: ["1", "2", "3"], default_value: "1"},
    /*  8 */ "buyer_name": {required: false, type: 'string', default_value: ""},
    /*  9 */ "buyer_oib": {required: true, type: 'string', default_value: ""},
    /* 10 */ "invoice_date": {required: true, type: 'Date', format: "DDMMYYYY", default_value: "01011970"},
    /* 11 */ "invoice_number": {required: true, type: 'string', default_value: ""},
    /* 12 */ "delivery_date": {required: false, type: 'Date', format: "DDMMYYYY", default_value: "01011970"},
    /* 13 */ "total_amount": {required: true, type: 'number', format: 2, default_value: 0.00},
    /* 14 */ "vat_base_5": {required: true, type: 'number', format: 2, default_value: 0.00},
    /* 15 */ "vat_base_13": {required: true, type: 'number', format: 2, default_value: 0.00},
    /* 16 */ "vat_base_25": {required: true, type: 'number', format: 2, default_value: 0.00},
    /* 17 */ "vat_amount_5": {required: true, type: 'number', format: 2, default_value: 0.00},
    /* 18 */ "vat_amount_13": {required: true, type: 'number', format: 2, default_value: 0.00},
    /* 19 */ "vat_amount_25": {required: true, type: 'number', format: 2, default_value: 0.00},
    /* 20 */ "vat_na": {required: true, type: 'number', format: 2, default_value: 0.00},
    /* 21 */ "vat_freed": {required: true, type: 'number', format: 2, default_value: 0.00},
  };

  function formatDate(date) {
    var dd = date.getDate();
    var mm = date.getMonth() + 1; // January is 0.
    var yyyy = date.getFullYear();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    return dd.toString() + mm.toString() + yyyy.toString();
  }

  function checkType(value, type, field_name) {
    if (type == "Date" && typeof value == "object" && typeof value.getDate == "function") {
      return;
    }

    if (typeof value != type) {
        throw "Invalid type for " + field_name;
    }
  }

  function validateAndFormatItems(data) {
    for (var field in fields) {
      var validation = fields[field];

      if (!(field in data)) {
        if (validation.required) {
          throw "Missing required field" + field;
        } else {
          data[field] = validation.default_value;
        }
      }

      var value = data[field];

      switch(validation.type) {
        case "Date":
          checkType(value, validation.type, field);
          data[field] = formatDate(value);
          break;
        case "string":
          checkType(value, validation.type, field);
          break;
        case "number":
          checkType(value, validation.type, field);
          data[field] = value.toFixed(2);
          break;
        case "enum":
          if (validation.values.indexOf(value) < 0) {
            throw "Invalid enum value for " + field;
          }
          data[field] = value;
          break;
        default:
          throw "Unknown type " + validation.type
      }
    }

    return data;
  }

  /**
   * Validates and formats the e-URA data for use in QR code.
   */
  this.formatQrCodeData = function(data) {
    // http://www.e-ura.hr/Struktura%20podataka%20e-ura.pdf
    data = validateAndFormatItems(data);

    var LF = "\n";
    var out = "";
    // 0. Oznaka za UTF-8
    // Skip since Google does it.

    // 1. Zaglavlje
    out += "www.e-URA.hr" + LF; // len = 12
    // 2. Vrsta dokumenta (račun = 01)
    out += "01" + LF // len = 2
    // 3. Naziv prodavatelja
    out += data.merchant_name + LF;
    // 4. OIB prodavatelja
    out += data.merchant_oib + LF;
    // 5. IBAN prodavatelja
    out += data.merchant_iban + LF;
    // 6. Poziv na broj
    out += data.reference_number + LF;
    // 7. Obračun PDV-a (1-po fakturi, 2-po naplati, 3-nije obveznik)
    out += data.vat_mode + LF; // len = 1
    // 8. Naziv kupca
    out += data.buyer_name + LF;
    // 9. OIB kupca
    out += data.buyer_oib + LF;
    // 10. Datum računa (Format: DDMMYYYY)
    out += data.invoice_date + LF; // len = 8
    // 11. Broj računa
    out += data.invoice_number + LF;
    // 12. Datum dospijeća računa
    out += data.delivery_date + LF;
    // 13. Ukupan iznos računa DA Format: #0.00
    out += data.total_amount + LF;
    // 14. Osnovica za PDV 5% DA Format: #0.00
    out += data.vat_base_5 + LF;
    // 15. Osnovica za PDV 13% DA Format: #0.00
    out += data.vat_base_13 + LF;
    // 16. Osnovica za PDV 25% DA Format: #0.00
    out += data.vat_base_25 + LF;
    // 17. Iznos PDV-a po stopi 5% DA Format: #0.00
    out += data.vat_amount_5 + LF;
    // 18. Iznos PDV-a po stopi 13% DA Format: #0.00
    out += data.vat_amount_13 + LF;
    // 19. Iznos PDV-a po stopi 25% DA Format: #0.00
    out += data.vat_amount_25 + LF;
    // 20. Ne podliježe PDV-u DA Format: #0.00
    out += data.vat_na + LF;
    // 21 Oslobođeno PDV-a DA Format: #0.00
    out += data.vat_freed + LF;
    // 22 Undocumented value.
    out += "0.00" + LF

    return out;
  }

  /**
   * Generates the QR code URL for arbitrary text.
   */
  this.getQrCodeImageUrl = function(text, w, h) {
    checkType(text, "string", "text");
    w = w == undefined ? 300 : w;
    h = h == undefined ? 300 : h;

    return "https://chart.googleapis.com/chart" +
           "?cht=qr" +
           "&chld=M" +  // medium level error correction
           "&choe=UTF-8" +
           "&chs=" + w + "x" + h +
           "&chl=" + encodeURIComponent(text);
  }

  /**
   * Generates the QR code URL for the e-URA data object.
   */
  this.generateQrCodeImageUrl = function(data, w, h) {
    var text = this.formatQrCodeData(data);
    return this.getQrCodeImageUrl(text, w, h);
  }

  /**
   * Gets the e-URA data object with default values (e.g. zero, empty string,
   * etc.).
   */
  this.getDefaultDataObject = function() {
    var data = {};
    for (var field in fields) {
      var validation = fields[field];
      data[field] = validation.default_value;
    }
    return data;
  }
}
