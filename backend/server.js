
import express from 'express';
import { pool } from '../db/connect.js';

const db = pool();

const port = 3002;
const server = express();


 // Testmusik til vores jukebox
const testSongs = [
    {
        track_id: 1001,
        title: "Make Funk",
        artist: "HoliznaCC0",
        audio_url: "/music/song1.mp3"
    },
    {
        track_id: 1002,
        title: "So Broke",
        artist: "HoliznaCC0",
        audio_url: "/music/song3.mp3"
    },
    {
        track_id: 1003,
        title: "The Power Of The Beat",
        artist: "Play House",
        audio_url: "/music/song2.mp3"
    }
];


// Gør frontend-filer tilgængelige og modtager JSON-data fra brugeren
server.use(express.static('frontend'));
server.use(express.json());
server.use(onEachRequest);
server.get('/api/artists', onGetArtists)
server.get('/api/artists/:artistId', onGetDiscography)
server.get('/api/artists/:artistId/albums', onGetAlbums)
server.get('/api/search', onSearchSongs);
server.get('/api/songs', onGetSongs);
// server.get('/api/queue/:id', onGetaddToQueue);
// API-ruter: Kobler adresser til funktioner
server.post('/api/queue', onAddSongToQueue);
server.get('/api/queue', onGetQueue);
server.post('/api/queue/next', onGetNextSong);
server.get('/api/tracks', onGetTracks);

// Køen gemmer sangene i den rækkefølge, de bliver tilføjet
let queue = [];

// Tilføjer en sang til slutningen af køen
function addToQueue(song) {
    queue.push(song);
}

// Henter og fjerner den første sang fra køen (FIFO)
function playNextSong() {
    if (queue.length === 0) {
        console.log("Køen er tom!");
        return null;
    }

    const nextSong = queue.shift();
    console.log("Afspiller nu:", nextSong.title);

    return nextSong;
}

// POST: Modtager et track_id fra frontend og tilføjer sangen
async function onAddSongToQueue(request, response) {

    // Henter sangens ID fra JSON-data i request.body
    const trackId = request.body?.track_id;

    // Kontrollerer at ID'et er et gyldigt tal
    if (!Number.isInteger(trackId) || trackId <= 0) {
        return response.status(400).json({
            error: "Ugyldigt track_id"
        });
    }

    try {
     const testSong = testSongs.find(song => song.track_id === trackId);

        if (testSong) {
            addToQueue(testSong);

            return response.json({
                message: "Testsang tilføjet til køen",
                queue: queue
            });
        }   
        // Finder sangen i Neon-databasen via dens ID
        const result = await db.query(
            'SELECT track_id, title FROM tracks WHERE track_id = $1',
            [trackId]
        );

        // Giver fejl hvis sangen ikke findes
        if (result.rows.length === 0) {
            return response.status(404).json({
                error: "Sangen findes ikke"
            });
        }

        // Tilføjer den fundne sang til køen
        addToQueue(result.rows[0]);

        // Sender den opdaterede kø tilbage som JSON
        response.json({
            message: "Sang tilføjet til køen",
            queue: queue
        });

    } catch (error) {
        console.error(error);

        response.status(500).json({
            error: "Databasefejl"
        });
    }
}

// GET: Sender alle ventende sange tilbage til frontend
function onGetQueue(request, response) {
    response.json({
        queue: queue
    });
}

// POST: Henter og fjerner næste sang til afspilleren
function onGetNextSong(request, response) {

    const nextSong = playNextSong();

    if (!nextSong) {
        return response.status(404).json({
            message: "Køen er tom"
        });
    }

    // Sender sangens ID, titel og den resterende kø
    response.json({
        message: "Næste sang hentet",
        song: nextSong,
        queue: queue
    });
}

// GET: Henter fem sange fra Neon-databasen
async function onGetTracks(request, response) {
    try {
        const result = await db.query(
            'SELECT * FROM tracks LIMIT 5'
        );

        response.json([...testSongs, ...result.rows]);

    } catch (error) {
        console.error(error);

        response.status(500).json({
            error: "Kunne ikke hente sange"
        });
    }
}

 async function onGetArtists(request, response) {
    const artistsDb = await db.query(`SELECT stage_name AS Artists FROM artists`);
    response.json(artistsDb.rows);
 }

async function onSearchSongs(request, response) {
    const query = request.query.q;
    if (typeof query !== 'string' || query.trim() === '') {
        return response.json([]);
    }

    try {
        const result = await db.query(
            'SELECT title FROM songs WHERE title ILIKE $1 ORDER BY title',
            [`%${query.trim()}%`]
        );
        response.json(result.rows);
    } catch (error) {
        console.error('Fejl ved søgning i databasen:', error);
        response.status(500).json({ error: 'Kunne ikke søge i databasen' });
    }
}

 async function onGetDiscography(request, response) {
    const artistId = request.params.artistId;
    const artistsDb = await db.query(`
        SELECT s.title AS Title, a.stage_name as Artist 
        FROM songs s
        JOIN artists a ON s.artist_id=a.artist_id 
        WHERE a.artist_id = $1
        `, [artistId]);
    response.json(artistsDb.rows);
 }

 async function onGetAlbums(request, response) {
    const artistId = request.params.artistId;
    const albums = await db.query(`
        SELECT a.title FROM albums a
        JOIN artists ar on a.artist_id=ar.artist_id
        WHERE ar.artist_id = $1
        `, [artistId]);
    response.json(albums.rows);
}

async function onGetAlbumGenre(request, response) {
    const albumId = request.params.albumId;
    const genre = await db.query(`
        SELECT g.genre 
        FROM albums a
        JOIN genre g on g.genre_id=a.genre_id
        WHERE a.album_id = $1
        `, [albumId]);
        response.json(genre.rows)
}

async function onGetGenres(request, response) {
    const genres = await db.query(`
        SELECT genre from genres
        `);
        response.json(genres.rows)
}

async function onGetSongs(request, response) {
    try {
        const songs = await db.query(`
            SELECT s.title, a.stage_name AS artist, g.genre_name AS genre
            FROM songs s
            JOIN artists a ON s.artist_id = a.artist_id
            LEFT JOIN genres g ON s.genre_id = g.genre_id
            ORDER BY s.title
        `);
        response.json(songs.rows);
    } catch (error) {
        console.error('Fejl ved hentning af sange:', error);
        response.status(500).json({ error: 'Kunne ikke hente sange' });
    }
}
// Logger når serveren er startet
function onServerReady() {
    console.log('Webserver running on port', port);
}

// Logger alle HTTP-forespørgsler til serveren
function onEachRequest(request, response, next) {
    console.log(new Date(), request.method, request.url);
    next();
}

// Starter Express-serveren
server.listen(port, onServerReady);
