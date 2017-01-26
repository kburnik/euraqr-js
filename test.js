function test() {
  var euraQr = new EuraQr();
  var qrData = {
    "merchant_name": "Prodavac j.d.o.o.",
    "merchant_oib": "123123123",
    "merchant_iban": "HR5XXXXXXXXXXXXXXXXXXX",
    "reference_number": "1-4-10",
    "vat_mode": "3", // Nije obveznik PDV-a.
    "buyer_name": "Kupac .d.o.o.",
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
    "vat_na": 0,
    "vat_freed": 800.0 // Neoporezivo.
  }

  var w = 400, h = 400;
  var qrCodeImageUrl = euraQr.generateQrCodeImageUrl(qrData, w, h);

  var logger;
  try {
    logger = Logger;
  } catch(e) {
    logger = console;
  }
  logger.log(qrCodeImageUrl);

  if (document) {
    window.open(qrCodeImageUrl);
  }
}

/*
Scanned QR Example:
-----------------------------------------
www.e-URA.hr
01
Prodavac j.d.o.o.
123123123
HR5XXXXXXXXXXXXXXXXXXX
1-4-10
3
Kupac d.o.o.
2424242423
10022016
4/1/1
10022016
800.00
0.00
0.00
0.00
0.00
0.00
0.00
0.00
800.00
0.00
*/

