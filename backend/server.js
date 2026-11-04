import express from 'express';
import { pool } from '../db/connect.js';

const db = pool();

const port = 3002;
const server = express();

server.use(express.static('frontend'));
server.use(express.json());
server.use(onEachRequest);
//Modtager et sang-ID, finder sangen i databasen og tilføjer den til køen
server.post('/api/queue',async (request, response) => {
 const trackId = request.body.track_id;

    if (!Number.isInteger(trackId) || trackId <= 0) {
        return response.status(400).json({
            error: "Ugyldigt track_id"
        });
    }

    try {
        const result = await db.query(
            'SELECT track_id, title FROM tracks WHERE track_id = $1',
            [trackId]
        );

        if (result.rows.length === 0) {
            return response.status(404).json({
                error: "Sangen findes ikke"
            });
        }

        addToQueue(result.rows[0]);

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
}); 
//Viser alle sange, der venter i køen
server.get('/api/queue', (request, response) => {
    response.json({
        queue: queue
    });
});
// Henter de første 5 sange fra databasen
server.get('/api/tracks', async (request, response) => {
    try {
        const result = await db.query(
            'SELECT * FROM tracks LIMIT 5'
        );

        response.json(result.rows);
    } catch (error) {
        console.error(error);
        response.status(500).json({
            error: "Kunne ikke hente sange"
        });
    }
});
// Henter og fjerner den første sang i køen
server.post('/api/queue/next', (request, response) => {
    const nextSong = playNextSong();

    if (!nextSong) {
        return response.status(404).json({
            messsage: "Køen er tom"
        });
}

 response.json({
    message: "Næste sang hentet",
    song: nextSong,
    queue: queue
  });

});

server.listen(port, onServerReady);
// Gemmer sangene i den rækkefølge, de bliver tilføjet
let queue = [];
// Tilføjer en ny sang til slutningen af køen
function addToQueue(song)  {
  queue.push(song);
}

// Kontrollerer om køen er tom, ellers hentes og fjernes næste sang
function playNextSong() {
    if (queue.length === 0) {
        console.log("Køen er tom!");
        return;
    }

    let nextSong = queue.shift();
    console.log("Afspiller nu:", nextSong);
    return nextSong;
}

function onServerReady() {
    console.log('Webserver running on port', port);
}

function onEachRequest(request, response, next) {
    console.log(new Date(), request.method, request.url);
    next();
}
