# euraqr.js

## JS Library for generating invoice QR codes for accounting in Croatia

The library also works out of the box for:

* Vanilla JS
* Google Apps Script
* Node.js

## Generiranje e-URA računovodstvenog QR kod-a pomoću Javascripta

```html
<script src="/js/euraqr.js"></script>
```

```javascript
var euraQr = new EuraQr();
var qrData = {
  "merchant_name": "Prodavac j.d.o.o.",
  "merchant_oib": "123123123",
  "merchant_iban": "HR5XXXXXXXXXXXXXXXXXXX",
  "reference_number": "1-4-10",
  "vat_mode": euraQr.VAT_MODE.NON_TAX_PAYER, // Nije obveznik PDV-a.
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
console.log(qrCodeImageUrl);
if (window) window.open(qrCodeImageUrl);
```


Scanned QR Example:
```
www.e-URA.hr
01
Prodavac j.d.o.o.
123123123
HR5XXXXXXXXXXXXXXXXXXX
1-4-10
3
Kupac .d.o.o.
2424242423
26012017
4/1/1
26012017
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
```

Preuzeto sa [http://www.e-ura.hr/](http://www.e-ura.hr/):

### e-URA - Automatsko knjiženje ulaznih računa.

Svaki račun sadrži podatke o prodavatelju, kupcu, iznosu istopama PDV-a koje
knjigovođa mora ručno unositi u program prilikom knjiženja ulaznog računa.
Da bi posao knjigovođi bio brži i točniji, svi bitni podaci mogu biti odštampani
na računu upotrebom QR koda:

![Primjer QR koda](https://chart.googleapis.com/chart?cht=qr&chld=M&choe=UTF-8&chs=400x400&chl=www.e-URA.hr%0A01%0AProdavac%20d.o.o.%0A111222333444%0AHR2360009988998877%0A33-111111%0A3%0AKupac%20j.d.o.o.%0A99988899988%0A26012017%0A4/1/1%0A26012017%0A800.00%0A0.00%0A0.00%0A0.00%0A0.00%0A0.00%0A0.00%0A0.00%0A800.00%0A0.00%0A)

eURA kod sadrži sljedeće podatke:

* Naziv prodavatelja
* OIB prodavatelja
* IBAN prodavatelja
* Poziv na broj
* Obračun PDV-a (po fakturi, po naplati, nije u sustavu PDV-a)
* Naziv kupca
* OIB kupca
* Datum računa
* Broj računa
* Datum dospijeeća
* Ukupan iznos računa
* Osnovica za PDV 5%
* Osnovica za PDV 13%
* Osnovica za PDV 25%
* Iznos PDV-a po stopi od 5%
* Iznos PDV-a po stopi od 13%
* Iznos PDV-a po stopi od 25%
* Iznos koji ne podliježe PDV-u (prolazne stavke)
* Iznos koji je oslobođen PDV-a

Osim za knjiženje ulaznih računa, eURA kod može se upotrijebiti i za knjiženje
izlaznih računa kod korisnika koji sami ispisuju račune, a kopiju računa šalju u
njigovodstveni servis na knjiženje.

eURA kod osmislila je tvrtka [Pupilla d.o.o](http://www.pupilla.hr/), ali ne
zadržava ekskluzivno pravo na njega, jer korisnost ovog sustava može doći do
punog izražaja samo ako ga i druge informatičke tvrtke ugrade u svoja rješenja,
kako bi svi računi na jednak način iskazivali podatke potrebne za automatsko
knjiženje.

Pozivaju se sve informatčke tvrtke u Hrvatskoj da se pridruže nastojanjima da
korisnicima pruže bolju funkcionalnost software-a kojeg koriste.

Za potrebe implementacije eURA koda, potrebnu dokumentaciju možete pronaći
[ovdje](http://e-ura.hr/Struktura%20podataka%20e-ura.pdf).
