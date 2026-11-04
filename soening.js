
const songs = [];

const input = document.getElementById("searchInput");
const button = document.getElementById("searchButton");
const results = document.getElementById("results");


// Jeg har brugt getElementById() til at forbinde JavaScript med søgefeltet i HTML.
// Jeg har brugt filter() og includes() til at finde sange og albums, der passer til brugerens søgning.
// Jeg har også brugt addEventListener(), så søgningen reagerer, når brugeren skriver eller trykker på søgeknappen.


function searchMusic() {
    const search = input.value.toLowerCase().trim();

    results.innerHTML = "";

    if (search === "") return;

    const matches = songs.filter(song =>
        song.title.toLowerCase().includes(search) ||
        song.album.toLowerCase().includes(search)
    );

    matches.forEach(song => {
        const div = document.createElement("div");
        div.className = "song-result";
        div.textContent = song.title + " - " + song.album;
        results.appendChild(div);
    });

    if (matches.length === 0) {
        results.textContent = "Ingen sange fundet";
    }
}

button.addEventListener("click", searchMusic);
input.addEventListener("input", searchMusic);
