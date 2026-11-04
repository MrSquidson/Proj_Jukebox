// Her laver vi en liste med de sange, der ligger i kurven
let cart = [
    { title: "Smells Like Teen Spirit", artist: "Nirvana", price: 1 },
    { title: "Highway To Hell", artist: "ACDC", price: 1
     }
];

// Vi finder de forskellige HTML-elementer, som vi skal bruge
let cartElement = document.getElementById("cart");
let totalElement = document.getElementById("total");
let messageElement = document.getElementById("message");

// Vi starter den samlede pris på 0
let total = 0;

// forEach går igennem alle sangene i kurven én efter én
cart.forEach(function(song) {

    // Vi viser sangens titel, kunstner og pris på hjemmesiden
    cartElement.innerHTML +=
        "<p>" + song.title + " - " + song.artist +
        " - " + song.price + " tk.</p>";

    // Vi lægger sangens pris oven i den samlede pris
    total = total + song.price;
});

// Vi viser den samlede pris på hjemmesiden
totalElement.textContent = "Subtotal: " + total + " tk.";


// Denne funktion bliver kørt, når kunden trykker på "Betal nu"
function pay() {

    // Vi undersøger, hvilken betalingsmetode kunden har valgt
    let payment = document.querySelector(
        'input[name="payment"]:checked'
    );

    // Hvis kurven er tom, viser vi en besked
    if (cart.length == 0) {
        messageElement.textContent = "Din kurv er tom!";
    }

    // Hvis kunden ikke har valgt en betalingsmetode
    else if (payment == null) {
        messageElement.textContent =
            "Du skal vælge en betalingsmetode!";
    }

    // Hvis alt er valgt korrekt, viser vi en succesbesked
    else {
        messageElement.textContent =
            "Betaling gennemført med " + payment.value + "!";

        // Vi tømmer kurven efter betalingen
        cart = [];

        // Vi fjerner sangene fra hjemmesiden
        cartElement.innerHTML = "";

        // Vi nulstiller den samlede pris
        totalElement.textContent = "Subtotal: 0 kr.";
    }
}