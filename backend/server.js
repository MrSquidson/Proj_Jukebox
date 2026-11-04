import express from 'express';
import { pool } from '../db/connect.js';

const db = pool();

const port = 3002;
const server = express();

server.use(express.static('frontend'));
server.use(express.json());
server.use(onEachRequest);
// server.get('/api/queue/:id', onGetaddToQueue);
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
server.get('/api/queue', (request, response) => {
    response.json({
        queue: queue
    });
});

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

let queue = [];

function addToQueue(song)  {
  queue.push(song);
}


function playNextSong() {
    if (queue.length === 0) {
        console.log("Køen er tom!");
        return;
    }

    let nextSong = queue.shift();
    console.log("Afspiller nu:", nextSong);
    return nextSong;
}

 // addToQueue("Song A");
 // addToQueue("Song B");

 // playNextSong();
 // playNextSong();
 // playNextSong();

 // console.log("Sange tilbage i køen:", queue);



function onServerReady() {
    console.log('Webserver running on port', port);
}

function onEachRequest(request, response, next) {
    console.log(new Date(), request.method, request.url);
    next();
}
