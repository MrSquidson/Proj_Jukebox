const input = document.getElementById("searchInput");
const form = document.getElementById("searchForm");
const results = document.getElementById("results");
let searchController;

async function searchMusic() {
    const query = input.value.trim();
    searchController?.abort();
    results.replaceChildren();

    if (query === "") return;

    const controller = new AbortController();
    searchController = controller;
    results.textContent = "Søger...";

    try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
            signal: controller.signal
        });

        if (!response.ok) {
            throw new Error(`Search API returned HTTP ${response.status}`);
        }

        const matches = await response.json();
        if (searchController !== controller) return;

        results.replaceChildren();

        if (matches.length === 0) {
            results.textContent = "Ingen sange fundet";
            return;
        }

        matches.forEach(song => {
            const div = document.createElement("div");
            div.className = "song-result";
            div.textContent = song.title;
            results.appendChild(div);
        });
    } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Fejl ved søgning:", error);
        const statusCode = Number(error.message.match(/HTTP (\d+)/)?.[1]);
        if (statusCode === 404) {
            results.textContent = "Søgeruten mangler på serveren. Stop og genstart backend-serveren.";
        } else if (statusCode >= 500) {
            results.textContent = "Søgningen fejlede på serveren. Se backend-terminalen for databasefejl.";
        } else if (statusCode > 0) {
            results.textContent = `Søgeserveren svarede med fejl ${statusCode}.`;
        } else {
            results.textContent = "Kunne ikke få forbindelse til søgeserveren. Kontrollér, at den kører.";
        }
    }
}

form.addEventListener("submit", event => {
    event.preventDefault();
    searchMusic();
});
input.addEventListener("input", searchMusic);
