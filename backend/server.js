
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
