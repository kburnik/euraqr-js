/**
 * @fileoverview Generate QR codes for invoices in Croatia (e-URA).
 */

/*
 * Handles Generating QR codes for invoices based on e-Ura.
 * (http://www.e-ura.hr/).
 * @constructor
 */
var EuraQr = function() {
  /**
   * Enum of values applied for taxation.
   */
  this.VAT_MODE = {
    // Po fakturi.
    AT_INVOICE: 1,
    // Po naplati.
    AT_PAYMENT: 2,
    // Nije obeznik PDV-a.
    NON_TAX_PAYER: 3
  };

  /**
   * The validation dictionary. This is a representation of the e-URA QR
   * from the specification.
   */
  var fields = {
    "merchant_name": {required: false, type: 'string', def: ""},
    "merchant_oib": {required: true, type: 'string', def: ""},
    "merchant_iban": {required: false, type: 'string', def: ""},
    "reference_number": {required: false, type: 'string', def: ""},
    "vat_mode": {required: true, type: 'enum', values: this.VAT_MODE,
                 def: this.VAT_MODE},
    "buyer_name": {required: false, type: 'string', def: ""},
    "buyer_oib": {required: true, type: 'string', def: ""},
    "invoice_date": {required: true, type: 'Date', format: "DDMMYYYY",
                     def: "01011970"},
    "invoice_number": {required: true, type: 'string', def: ""},
    "delivery_date": {required: false, type: 'Date', format: "DDMMYYYY",
                      def: "01011970"},
    "total_amount": {required: true, type: 'number', format: 2, def: 0.00},
    "vat_base_5": {required: true, type: 'number', format: 2, def: 0.00},
    "vat_base_13": {required: true, type: 'number', format: 2, def: 0.00},
    "vat_base_25": {required: true, type: 'number', format: 2, def: 0.00},
    "vat_amount_5": {required: true, type: 'number', format: 2, def: 0.00},
    "vat_amount_13": {required: true, type: 'number', format: 2, def: 0.00},
    "vat_amount_25": {required: true, type: 'number', format: 2, def: 0.00},
    "vat_na": {required: true, type: 'number', format: 2, def: 0.00},
    "vat_freed": {required: true, type: 'number', format: 2, def: 0.00},
  };

  /**
   * Formats a JS Date object into a string of DDMMYYY format.
   * @param {Date} date A JS Date object.
   * @return {string} A string with the DDMMYYYY formated date.
   */
  function formatDate(date) {
    var dd = date.getDate();
    var mm = date.getMonth() + 1; // January is 0.
    var yyyy = date.getFullYear();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    return dd.toString() + mm.toString() + yyyy.toString();
  }

  /**
   * Validates a value for a given field type. Throws when invalid.
   * @param {string|number|Date} value Value to validate
   * @param {string} type Required type of the value.
   * @param {string} field_name Name of field to include in the exception.
   */
  function checkType(value, type, field_name) {
    if (type == "Date" && typeof value == "object" &&
        typeof value.getDate == "function") {
      return;
    }

    if (typeof value != type) {
        throw "Invalid type for " + field_name;
    }
  }

  /**
   * Validates the JSON form of the e-ura QR data and serializes the fields.
   * @param {object} data Object with unserialized eUra data.
   * @returns {object} New object with same keys but with serialized values.
   */
  function validateAndFormatItems(data) {
    var out = {};
    for (var field in fields) {
      var validation = fields[field];

      if (!(field in data)) {
        if (validation.required) {
          throw "Missing required field" + field;
        } else {
          out[field] = validation.def;
        }
      }

      var value = data[field];

      switch(validation.type) {
        case "Date":
          checkType(value, validation.type, field);
          out[field] = formatDate(value);
          break;
        case "string":
          checkType(value, validation.type, field);
          out[field] = value;
          break;
        case "number":
          checkType(value, validation.type, field);
          out[field] = value.toFixed(2);
          break;
        case "enum":
          var values = [];
          for (var k in validation.values) {
              values.push(validation.values[k]);
          }
          if (values.indexOf(value) < 0) {
            throw "Invalid enum value for " + field;
          }
          out[field] = value.toString();
          break;
        default:
          throw "Unknown type " + validation.type
      }
    }

    return out;
  }

  /**
   * Generates the QR code URL for arbitrary text.
   * @param {string} text Text to encode.
   * @param {number} w Width for the QR code image.
   * @param {number} h Height for the QR code image.
   * @param {string} ecl Error correction level (L, M, H).
   * @return {string} URL of the QR code.
   */
  function getQrCodeImageUrl(text, w, h, ecl) {
    checkType(text, "string", "text");
    w = w == undefined ? 300 : w;
    h = h == undefined ? 300 : h;
    ecl = ecl == undefined ? "M": ecl;

    return "https://chart.googleapis.com/chart" +
           "?cht=qr" +
           "&choe=UTF-8" +
           "&chld=" + ecl +  // medium level error correction
           "&chs=" + w + "x" + h +
           "&chl=" + encodeURIComponent(text);
  }

  /**
   * Validates and formats e-URA data into a UTF-8 string for use in QR code.
   * See: http://www.e-ura.hr/Struktura%20podataka%20e-ura.pdf
   * @param {object} data Object with unserialized eUra data.
   * @return {string} A string serialzed for direct use in a QR generator.
   */
  this.formatQrCodeData = function(data) {
    var vd = validateAndFormatItems(data);
    var bundle = [
      // 0. Oznaka za UTF-8 - Skip since Google does it.
      // 1. Zaglavlje (len = 12)
      "www.e-URA.hr",
      // 2. Vrsta dokumenta (račun = 01, len = 2)
      "01",
      // 3. Naziv prodavatelja
      vd.merchant_name,
      // 4. OIB prodavatelja
      vd.merchant_oib,
      // 5. IBAN prodavatelja
      vd.merchant_iban,
      // 6. Poziv na broj
      vd.reference_number,
      // 7. Obračun PDV-a (1-po fakturi, 2-po naplati, 3-nije obveznik) len = 1
      vd.vat_mode,
      // 8. Naziv kupca
      vd.buyer_name,
      // 9. OIB kupca
      vd.buyer_oib,
      // 10. Datum računa (Format: DDMMYYYY, len = 8)
      vd.invoice_date,
      // 11. Broj računa
      vd.invoice_number,
      // 12. Datum dospijeća računa
      vd.delivery_date,
      // 13. Ukupan iznos računa (Format: #0.00)
      vd.total_amount,
      // 14. Osnovica za PDV 5% (Format: #0.00)
      vd.vat_base_5,
      // 15. Osnovica za PDV 13% (Format: #0.00)
      vd.vat_base_13,
      // 16. Osnovica za PDV 25% (Format: #0.00)
      vd.vat_base_25,
      // 17. Iznos PDV-a po stopi 5% (Format: #0.00)
      vd.vat_amount_5,
      // 18. Iznos PDV-a po stopi 13% (Format: #0.00)
      vd.vat_amount_13,
      // 19. Iznos PDV-a po stopi 25% (Format: #0.00)
      vd.vat_amount_25,
      // 20. Ne podliježe PDV-u (Format: #0.00)
      vd.vat_na,
      // 21 Oslobođeno PDV-a (Format: #0.00)
      vd.vat_freed,
      // 22. Undocumented value (seems to appear in production use).
      "0.00",
      // Last LF.
      ""
    ];

    return bundle.join("\n");
  }

  /**
   * Generates the QR code URL for the e-URA data object.
   * @param {object} data Object with unserialized eUra data.
   * @param {number} w Width for the QR code image.
   * @param {number} h Height for the QR code image.
   * @param {string} ecl Error correction level (L, M, H).
   * @return {string} URL of the QR code.
   */
  this.generateQrCodeImageUrl = function(data, w, h, ecl) {
    var text = this.formatQrCodeData(data);
    return getQrCodeImageUrl(text, w, h, ecl);
  }

  /**
   * Creates a e-URA data default object. This is useful when you only need to
   * to set a subset of keys or for testing.
   * @return {object} E-ura unserialized data with default values.
   */
  this.createDefaultDataObject = function() {
    var data = {};
    for (var field in fields) {
      var validation = fields[field];
      data[field] = validation.def;
    }
    return data;
  }
}
