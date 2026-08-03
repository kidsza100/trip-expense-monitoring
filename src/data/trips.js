export const initialTrips = [
  {
    id: "italy-2026",
    name: "Italy Trip (19-28 Sep 2026)",
    participants: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"],
    accounts: {
      "Apichanat": { bankName: "Kasikorn Bank (KBank)", accountNumber: "123-4-56789-0", accountName: "Apichanat Aroonkamon", family: "Family A" },
      "Potchara": { bankName: "Siam Commercial Bank (SCB)", accountNumber: "987-6-54321-0", accountName: "Potchara Waipinit", family: "Family A" },
      "Thitiwut": { bankName: "Bangkok Bank (BBL)", accountNumber: "456-7-89012-3", accountName: "Thitiwut Piriyakulchai", family: "Family B" },
      "Woraphan": { bankName: "Krungthai Bank (KTB)", accountNumber: "321-0-98765-4", accountName: "Woraphan Rungruang", family: "Family B" }
    },
    expenses: [
      // Flight ticket - HAS TICKET (Flight ticket.pdf) -> Paid by Thitiwut
      { id: 1, date: "2026-07-31", activity: "Flight ticket (Germany - Naples / Rome - Germany)", category: "Flight ticket", budget: 1000.00, actual: 859.40, status: "paid", paidBy: "Thitiwut", hasTicket: true, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      
      // 18-Sep
      { id: 2, date: "2026-09-18", activity: "Train discount 20%", category: "Transportation", budget: 0.0, actual: 39.40, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 3, date: "2026-09-18", activity: "Taxi to Hotel", category: "Transportation", budget: 25.00, actual: 25.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 4, date: "2026-09-18", activity: "Hotel Accomodation (Naples)", category: "Accomodation", budget: 200.00, actual: 182.40, status: "paid", paidBy: "Thitiwut", hasTicket: true, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 5, date: "2026-09-18", activity: "Dinner", category: "Food", budget: 100.00, actual: 60.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },

      // 19-Sep
      { id: 6, date: "2026-09-19", activity: "Train to Sorrento 11:26 (Campania Express)", category: "Transportation", budget: 60.00, actual: 48.00, status: "paid", paidBy: "Thitiwut", hasTicket: true, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 7, date: "2026-09-19", activity: "Breakfast", category: "Food", budget: 40.00, actual: 40.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 8, date: "2026-09-19", activity: "Lunch", category: "Food", budget: 50.00, actual: 50.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 9, date: "2026-09-19", activity: "Hotel Accomodation (Sorrento - GIAGGIARIELLO APART)", category: "Accomodation", budget: 800.00, actual: 769.56, status: "paid", paidBy: "Thitiwut", hasTicket: true, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 10, date: "2026-09-19", activity: "Dinner", category: "Food", budget: 120.00, actual: 120.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },

      // 20-Sep
      { id: 11, date: "2026-09-20", activity: "Ferry to Amalfi", category: "Transportation", budget: 200.00, actual: 206.00, status: "paid", paidBy: "Thitiwut", hasTicket: true, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 12, date: "2026-09-20", activity: "Brunch", category: "Food", budget: 40.00, actual: 40.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 13, date: "2026-09-20", activity: "Lunch", category: "Food", budget: 50.00, actual: 50.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 14, date: "2026-09-20", activity: "Afternoon Snack", category: "Food", budget: 10.00, actual: 10.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 15, date: "2026-09-20", activity: "Dinner", category: "Food", budget: 120.00, actual: 120.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },

      // 21-Sep
      { id: 16, date: "2026-09-21", activity: "Bus to Positano (10€/day/person)", category: "Transportation", budget: 40.00, actual: 40.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 17, date: "2026-09-21", activity: "Brunch", category: "Food", budget: 40.00, actual: 40.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 18, date: "2026-09-21", activity: "Lunch", category: "Food", budget: 50.00, actual: 50.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 19, date: "2026-09-21", activity: "Afternoon Snack", category: "Food", budget: 10.00, actual: 10.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 20, date: "2026-09-21", activity: "Dinner", category: "Food", budget: 120.00, actual: 60.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },

      // 22-Sep
      { id: 21, date: "2026-09-22", activity: "Brunch", category: "Food", budget: 40.00, actual: 40.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 22, date: "2026-09-22", activity: "Lunch", category: "Food", budget: 50.00, actual: 50.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 23, date: "2026-09-22", activity: "Train to Pompei (Cheap train) 4€/PP", category: "Transportation", budget: 16.00, actual: 16.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 24, date: "2026-09-22", activity: "Pompei Museum", category: "Activities", budget: 100.00, actual: 80.00, status: "paid", paidBy: "Thitiwut", hasTicket: true, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 25, date: "2026-09-22", activity: "Bag storage", category: "Activities", budget: 12.00, actual: 12.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 26, date: "2026-09-22", activity: "Train to Pompei to Napoli Piazza Garibaldi 16:20", category: "Transportation", budget: 60.00, actual: 11.09, status: "paid", paidBy: "Thitiwut", hasTicket: true, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 27, date: "2026-09-22", activity: "Train to Rome 17:30 (Italo)", category: "Transportation", budget: 100.00, actual: 61.18, status: "paid", paidBy: "Thitiwut", hasTicket: true, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 28, date: "2026-09-22", activity: "Hotel Accomodation (Rome - APPARTAMENTO NUMA 1871)", category: "Accomodation", budget: 800.00, actual: 817.07, status: "paid", paidBy: "Thitiwut", hasTicket: true, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 29, date: "2026-09-22", activity: "Dinner", category: "Food", budget: 120.00, actual: 120.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },

      // 23-Sep
      { id: 30, date: "2026-09-23", activity: "Vatican City Tour (20€/Person)", category: "Activities", budget: 80.00, actual: 40.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 31, date: "2026-09-23", activity: "City transportation (8.5€/day/person)", category: "Transportation", budget: 34.00, actual: 34.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 32, date: "2026-09-23", activity: "Brunch", category: "Food", budget: 40.00, actual: 40.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 33, date: "2026-09-23", activity: "Lunch", category: "Food", budget: 50.00, actual: 50.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 34, date: "2026-09-23", activity: "Afternoon Snack", category: "Food", budget: 10.00, actual: 10.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 35, date: "2026-09-23", activity: "Dinner", category: "Food", budget: 120.00, actual: 60.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },

      // 24-Sep
      { id: 36, date: "2026-09-24", activity: "Colosseum/Roman Forum (18€/Person)", category: "Activities", budget: 72.00, actual: 36.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 37, date: "2026-09-24", activity: "City transportation (8.5€/day/person)", category: "Transportation", budget: 34.00, actual: 34.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 38, date: "2026-09-24", activity: "Brunch", category: "Food", budget: 40.00, actual: 40.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 39, date: "2026-09-24", activity: "Lunch", category: "Food", budget: 50.00, actual: 50.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 40, date: "2026-09-24", activity: "Afternoon Snack", category: "Food", budget: 10.00, actual: 10.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 41, date: "2026-09-24", activity: "Dinner", category: "Food", budget: 120.00, actual: 120.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },

      // 25-Sep - HAS TICKET
      { id: 42, date: "2026-09-25", activity: "Train to Florence 12:55 (Italo)", category: "Transportation", budget: 100.00, actual: 78.24, status: "paid", paidBy: "Thitiwut", hasTicket: true, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 43, date: "2026-09-25", activity: "Brunch", category: "Food", budget: 40.00, actual: 40.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 44, date: "2026-09-25", activity: "Lunch", category: "Food", budget: 50.00, actual: 50.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 45, date: "2026-09-25", activity: "Afternoon Snack", category: "Food", budget: 10.00, actual: 10.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 46, date: "2026-09-25", activity: "Hotel Accomodation (Florence - COMFORTABLE APARTMENT)", category: "Accomodation", budget: 500.00, actual: 494.18, status: "paid", paidBy: "Thitiwut", hasTicket: true, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 47, date: "2026-09-25", activity: "Dinner (Florence Florentine Steak)", category: "Food", budget: 120.00, actual: 220.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },

      // 26-Sep - HAS TICKET
      { id: 48, date: "2026-09-26", activity: "Accademia Gallery Tickets", category: "Activities", budget: 96.00, actual: 96.00, status: "paid", paidBy: "Thitiwut", hasTicket: true, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 49, date: "2026-09-26", activity: "City transportation (Florence)", category: "Transportation", budget: 20.00, actual: 20.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 50, date: "2026-09-26", activity: "Brunch", category: "Food", budget: 40.00, actual: 40.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 51, date: "2026-09-26", activity: "Lunch", category: "Food", budget: 50.00, actual: 50.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 52, date: "2026-09-26", activity: "Afternoon Snack", category: "Food", budget: 10.00, actual: 10.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 53, date: "2026-09-26", activity: "Dinner", category: "Food", budget: 120.00, actual: 60.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },

      // 27-Sep - HAS TICKET
      { id: 54, date: "2026-09-27", activity: "Train back to Rome 17:59 (Frecciarossa)", category: "Transportation", budget: 100.00, actual: 78.24, status: "paid", paidBy: "Thitiwut", hasTicket: true, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 55, date: "2026-09-27", activity: "Brunch", category: "Food", budget: 40.00, actual: 40.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 56, date: "2026-09-27", activity: "Lunch", category: "Food", budget: 50.00, actual: 50.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 57, date: "2026-09-27", activity: "Afternoon Snack", category: "Food", budget: 10.00, actual: 10.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 58, date: "2026-09-27", activity: "Dinner", category: "Food", budget: 120.00, actual: 120.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 59, date: "2026-09-27", activity: "Hotel Accomodation (Rome - Back)", category: "Accomodation", budget: 300.00, actual: 294.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },

      // 28-Sep
      { id: 60, date: "2026-09-28", activity: "Brunch", category: "Food", budget: 40.00, actual: 40.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 61, date: "2026-09-28", activity: "Lunch", category: "Food", budget: 50.00, actual: 50.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { id: 62, date: "2026-09-28", activity: "Souvenir", category: "Souvenirs", budget: 40.00, actual: 40.00, status: "pending", paidBy: "Thitiwut", hasTicket: false, involved: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] }
    ],
    tickets: [
      { name: "Flight ticket - Thitiwut, Woraphan.pdf", file: "Flight ticket - Thitiwut, Woraphan.pdf", passengers: ["Thitiwut", "Woraphan"] },
      { name: "Ferry Sorrento - Amalfi.pdf", file: "Ferry Sorrento - Amalfi.pdf", passengers: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { name: "Florence S.M.N_to_Rome Termini_27_ก.ย._1759.pdf", file: "Florence S.M.N_to_Rome Termini_27_ก.ย._1759.pdf", passengers: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { name: "Galleria dell'Accademia Ticket.pdf", file: "Galleria dell'Accademia Ticket.pdf", passengers: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { name: "Naple 18 Sep.pdf", file: "Naple 18 Sep.pdf", passengers: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { name: "Naples-Central_to_Rome-Termini_22_ก.ย._1730.pdf", file: "Naples-Central_to_Rome-Termini_22_ก.ย._1730.pdf", passengers: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { name: "Naples-P-Garibaldi-train-station_to_Sorrento_19_ก.ย._1126.pdf", file: "Naples-P-Garibaldi-train-station_to_Sorrento_19_ก.ย._1126.pdf", passengers: ["Apichanat", "Thitiwut", "Woraphan"] },
      { name: "Pompei ticket.pdf", file: "Pompei ticket.pdf", passengers: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { name: "Rome 27 Sep.pdf", file: "Rome 27 Sep.pdf", passengers: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { name: "Rome Termini_to_Florence S.M.N_25_ก.ย._1255.pdf", file: "Rome Termini_to_Florence S.M.N_25_ก.ย._1255.pdf", passengers: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { name: "Rome-Termini_to_Florence-S.M.N_25_ก.ย._1255.pdf", file: "Rome-Termini_to_Florence-S.M.N_25_ก.ย._1255.pdf", passengers: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { name: "Apichanat_Pompei_to_Naples Piazza Garibaldi_22_ก.ย._1620.pdf", file: "Apichanat_Pompei_to_Naples Piazza Garibaldi_22_ก.ย._1620.pdf", passengers: ["Apichanat"] },
      { name: "Potchara_Pompei_to_Naples Piazza Garibaldi_22_ก.ย._1620.pdf", file: "Potchara_Pompei_to_Naples Piazza Garibaldi_22_ก.ย._1620.pdf", passengers: ["Potchara"] },
      { name: "THITIWUT_Pompei_to_Naples Piazza Garibaldi_22_ก.ย._1620.pdf", file: "THITIWUT_Pompei_to_Naples Piazza Garibaldi_22_ก.ย._1620.pdf", passengers: ["Thitiwut"] },
      { name: "Woraphan_Pompei_to_Naples Piazza Garibaldi_22_ก.ย._1620.pdf", file: "Woraphan_Pompei_to_Naples Piazza Garibaldi_22_ก.ย._1620.pdf", passengers: ["Woraphan"] },
      { name: "Airbnb Sorrento Receipt (19-22 Sep).eml", file: "ยืนยันแล้ว_ การจองของคุณช่วงวันที่ 19–22 ก.ย..eml", passengers: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { name: "Airbnb Florence Receipt (25-27 Sep).eml", file: "ยืนยันแล้ว_ การจองของคุณช่วงวันที่ 25–27 ก.ย..eml", passengers: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] },
      { name: "Airbnb Rome Receipt (22-25 Sep).eml", file: "ยืนยันแล้ว_ การเดินทางวันที่ 22–25 กันยายน เราแนบใบเสร็จ Airbnb มาให้ด้วย.eml", passengers: ["Apichanat", "Potchara", "Thitiwut", "Woraphan"] }
    ]
  }
];
