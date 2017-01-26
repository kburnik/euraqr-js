function test() {
  var euraQr = new EuraQr();
  var qrData = {
    "merchant_name": "Prodavač j.d.o.o.",
    "merchant_oib": "123123123",
    "merchant_iban": "HR5XXXXXXXXXXXXXXXXXXX",
    "reference_number": "1-4-10",
    "vat_mode": euraQr.VAT_MODE.NON_TAX_PAYER, // Nije obveznik PDV-a.
    "buyer_name": "Kupac d.o.o.",
    "buyer_oib": "2424242423",
    "invoice_date": new Date(),
    "invoice_number": "4/1/1",
    "delivery_date": new Date(),
    "total_amount": 800.0,
    "vat_base_5": 0,
    "vat_base_13": 0,
    "vat_base_25": 0,
    "vat_amount_5": 0,
    "vat_amount_13": 0,
    "vat_amount_25": 0,
    "vat_not_applicable": 0, // Ne podliježe PDV-u.
    "vat_exempt": 800.0 // Oslobođeno PDV-a.
  }

  var w = 400, h = 400;
  var qrCodeImageUrl = euraQr.generateQrCodeImageUrl(qrData, w, h);

  var logger;
  try {
    logger = Logger;
  } catch(e) {
    logger = console;
  }

  logger.log("QR image:");
  logger.log(qrCodeImageUrl);

  logger.log("Decoded QR image:");
  logger.log("https://zxing.org/w/decode?u=" +
              encodeURIComponent(qrCodeImageUrl));
}

