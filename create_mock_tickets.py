import os

dest_dir = r"d:\Trip expense monitoring\public\tickets"
if not os.path.exists(dest_dir):
    os.makedirs(dest_dir)

# File contents mapping
mocks = {
    "Apichanat_Pompei_to_Naples Piazza Garibaldi_22_ก.ย._1620.pdf": "Trenitalia Single Ticket\nPassenger: Apichanat Aroonkamon\nFrom: Pompei to Napoli Piazza Garibaldi\nDate: 22/09/2026 16:20\nAmount: 3.30 EUR\nBuyer: APICHANAT AROONKAMON\nPayment: Cash",
    "Potchara_Pompei_to_Naples Piazza Garibaldi_22_ก.ย._1620.pdf": "Trenitalia Single Ticket\nPassenger: Potchara Waipinit\nFrom: Pompei to Napoli Piazza Garibaldi\nDate: 22/09/2026 16:20\nAmount: 3.30 EUR\nBuyer: APICHANAT AROONKAMON\nPayment: Cash",
    "THITIWUT_Pompei_to_Naples Piazza Garibaldi_22_ก.ย._1620.pdf": "Trenitalia Single Ticket\nPassenger: THITIWUT PIRIYAKULCHAI\nFrom: Pompei to Napoli Piazza Garibaldi\nDate: 22/09/2026 16:20\nAmount: 3.30 EUR\nBuyer: APICHANAT AROONKAMON\nPayment: Cash",
    "Woraphan_Pompei_to_Naples Piazza Garibaldi_22_ก.ย._1620.pdf": "Trenitalia Single Ticket\nPassenger: Woraphan Rungruang\nFrom: Pompei to Napoli Piazza Garibaldi\nDate: 22/09/2026 16:20\nAmount: 3.30 EUR\nBuyer: APICHANAT AROONKAMON\nPayment: Cash",
    "Ferry Sorrento - Amalfi.pdf": "NLG Ferry Booking\nLine: SORRENTO-AMALFI\nPassengers: 4 (Piriyakulchai Thitiwut & Group)\nDate: 20/09/2026 09:30\nGrand Total: 104.00 EUR\nPaid online by Thitiwut Piriyakulchai",
    "Flight ticket.pdf": "EasyJet Booking Plan\nFlight 1: Munich to Naples (18 Sep 2026 20:45)\nFlight 2: Rome to Frankfurt (28 Sep 2026 13:00)\nPassengers: THITIWUT PIRIYAKULCHAI, WORAPHAN RUNGRUANG\nExtra Luggage: WORAPHAN RUNGRUANG (15kg Cabin bag)\nTotal Cost: 860.00 EUR\nPaid by Thitiwut & Woraphan (Shared flight)",
    "Florence S.M.N_to_Rome Termini_27_ก.ย._1759.pdf": "Trenitalia Frecciarossa 9323\nFrom: Firenze S. M. Novella to Roma Termini\nDate: 27/09/2026 17:59\nPassengers: Apichanat Aroonkamon, Potchara Waipinit, Thitiwut Piriyakulchai, Woraphan Rungruang\nTotal Amount: 100.00 EUR\nPaid by Apichanat Aroonkamon",
    "Galleria dell'Accademia Ticket.pdf": "Florence Accademia Gallery Reservation\nVisit Date: 26.09.2026 10:45\nCustomer: Thitiwut Piriyakulchai\nTickets for: Thitiwut Piriyakulchai, Woraphan Rungruang, Apichanat Aroonkamon, Potchara Waipinit\nTotal Amount: 96.00 EUR (4 x 24.00 EUR)\nPaid by Thitiwut Piriyakulchai",
    "Naple 18 Sep.pdf": "Naples Activities & Transport Info\nDate: 18 Sep 2026\nDetails of Naples logistics",
    "Naples-Central_to_Rome-Termini_22_ก.ย._1730.pdf": "Italo Train 9994\nFrom: Napoli Centrale to Roma Termini\nDate: 22 Sep 2026 17:30\nPassengers: Apichanat, Potchara, Thitiwut, Woraphan\nTotal: 79.60 EUR (4 x 19.90 EUR)\nPaid by MasterCard",
    "Naples-P-Garibaldi-train-station_to_Sorrento_19_ก.ย._1126.pdf": "Campania Express\nFrom: Naples Piazza Garibaldi to Sorrento\nDate: 19 Sep 2026 11:26\nPassengers: Apichanat, Thitiwut, Woraphan\nTotal: 45.00 EUR (3 x 15.00 EUR)\nPaid by Apichanat Aroonkamon",
    "Pompei ticket.pdf": "Pompeii Archaeological Park Ticket\nReservation for group entry\nDate: 22 Sep 2026\nTotal amount paid: 80.00 EUR",
    "Rome 27 Sep.pdf": "Rome Transit and Logistics Info\nDate: 27 Sep 2026",
    "Rome Termini_to_Florence S.M.N_25_ก.ย._1255.pdf": "Italo Train 8916\nFrom: Roma Termini to Firenze S. M. Novella\nDate: 25 Sep 2026 12:55\nPassengers: Apichanat, Potchara, Thitiwut, Woraphan\nTotal: 95.60 EUR (4 x 23.90 EUR)\nPaid by MasterCard",
    "Rome-Termini_to_Florence-S.M.N_25_ก.ย._1255.pdf": "Italo Train 8916 Duplicate\nFrom: Roma Termini to Firenze S. M. Novella\nDate: 25 Sep 2026 12:55\nPassengers: Apichanat, Potchara, Thitiwut, Woraphan\nTotal: 95.60 EUR\nPaid by MasterCard",
    "ยืนยันแล้ว_ การจองของคุณช่วงวันที่ 19–22 ก.ย..eml": "Airbnb Sorrento Confirmation\nListing: GIAGGIARIELLO APART SORRENTO ITALY\nDate: 19–22 Sep 2026\nTotal Paid: 769.56 EUR\nPaid via PayPal (t••••i@gmail.com = Thitiwut)",
    "ยืนยันแล้ว_ การจองของคุณช่วงวันที่ 25–27 ก.ย..eml": "Airbnb Florence Confirmation\nListing: NEW | COMFORTABLE APARTMENT NEAR STATION\nDate: 25–27 Sep 2026\nTotal Paid: 494.18 EUR\nPaid via PayPal (t••••i@gmail.com = Thitiwut)",
    "ยืนยันแล้ว_ การเดินทางวันที่ 22–25 กันยายน เราแนบใบเสร็จ Airbnb มาให้ด้วย.eml": "Airbnb Rome Confirmation\nListing: APPARTAMENTO NUMA 1871 COMFORT NEL CENTRO DI ROMA\nDate: 22–25 Sep 2026\nTotal Paid: 817.07 EUR\nPaid via PayPal (t••••i@gmail.com = Thitiwut)"
}

for filename, content in mocks.items():
    full_path = os.path.join(dest_dir, filename)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Mock ticket files created successfully!")
