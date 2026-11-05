const songList = document.getElementById('songList');

async function loadSongs() {
    try {
        const response = await fetch('/api/songs');
        if (!response.ok) {
            throw new Error(`Song request failed with status ${response.status}`);
        }

        const songs = await response.json();
        if (songs.length === 0) {
            songList.textContent = 'Ingen sange fundet';
            return;
        }

        songs.forEach(song => {
            const songElement = document.createElement('div');
            songElement.className = 'song';

            const title = document.createElement('h3');
            title.textContent = song.title;

            const artist = document.createElement('p');
            artist.textContent = `Artist: ${song.artist}`;

            const genre = document.createElement('p');
            genre.textContent = `Genre: ${song.genre ?? 'Unknown'}`;

            songElement.append(title, artist, genre);
            songList.appendChild(songElement);
        });
    } catch (error) {
        console.error('Fejl ved hentning af sange:', error);
        songList.textContent = 'Kunne ikke hente sange. Prøv igen senere.';
    }
}

loadSongs();