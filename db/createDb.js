import { connect } from './connect.js';
import upload from 'pg-upload';

const db = await connect();
const timestamp = (await db.query('select now() as timestamp')).rows[0]['timestamp'];
console.log(`Recreating database on ${timestamp}...`);

const tables = [
    "albumSongs",
    "albums",
    "songs",
    "artists",
    "genres"
]

const indexes = [

]

await indexes.forEach(async (db_index) => {
    await db.query(`DROP INDEX IF EXISTS ${db_index}`);
    console.log(`Dropped index ${db_index}`)
})

// drop all tables present in the list.
await tables.forEach(async (db_table) => {
    await db.query(`drop table if exists ${db_table}`);
    console.log(`Dropped table ${db_table}`);
});

await db.query(`
    create table artists (
        artist_id   integer primary key,
        stage_name  text not null,
        nationality char(2) not null,
        unique (stage_name, nationality)
    )
`);

//Opretter genres
await db.query(`
    create table genres (
    genre_id INTEGER PRIMARY KEY,
    genre_name TEXT NOT NULL UNIQUE
    
    )

`);

await db.query(`
    create table songs (
        song_id     integer primary key,
        title       text not null,
        artist_id   integer not null,
        genre_id integer not null,

        CONSTRAINT Fk_ArtistID FOREIGN KEY (artist_id)
        REFERENCES artists(artist_id),

        CONSTRAINT Fk_GenreID FOREIGN KEY (genre_id)
        REFERENCES genres(genre_id)
    )
`);

await db.query(`
    create table albums (
        album_id    integer primary key,
        title       text,
        artist_id   integer not null,
        unique(title, artist_id),
        CONSTRAINT FK_ArtistID FOREIGN KEY (artist_id)
        REFERENCES artists(artist_id)
    )
`);

await db.query(`
    create table albumSongs (
        album_id    integer,
        song_id     integer,
        unique(album_id, song_id),
        CONSTRAINT FK_AlbumID FOREIGN KEY (album_id)
        REFERENCES albums(album_id),
        CONSTRAINT FK_SongID FOREIGN KEY (song_id)
        REFERENCES songs(song_id)
    )
`);


// Insert tables in the remote database
/*
await db.query(`
    insert into actors (actor_id,stage_name,nationality,sex)
    values (1,foobar,DA,M)
`);
console.log(`Inserted table actors`);
*/

await db.query(`
    insert into artists (artist_id,stage_name,nationality)
    values (1,'foobar','DA'),(2,'Bikstok','DA'),(3,'Royalty Free Music','EN')
`);
console.log(`Inserted table artists`);

await db.query(`
    INSERT INTO genres (genre_id, genre_name)
    VALUES
        (1,'Rap'),
        (2, 'Hip Hop'),
        (3, 'Instrumental')
    `);

console.log('Inserted table genres');

await db.query(`
    insert into songs (song_id,title,artist_id, genre_id)
    values 
    (1,'foobars vilde rap',1, 1),
    (2,'Uranium',2, 2),
    (3,'Tyveknægt',2, 2),
    (4,'Sneaky Snitch',3, 3),
    (5,'Spinning Monkeys',3, 3)
`);
console.log(`Inserted table songs`);

await db.query(`
    insert into albums (album_id,title,artist_id)
    values (1,'foobars store album',1),(2,'Uranium',2),(3,'Royalty Free Music',3)
`);
console.log(`Inserted table albums`);

await db.query(`
    CREATE INDEX idx_song_titles
    ON songs (title)
    `)
console.log('Created song title index')

// Upload data from CSV files into the tables on remote
/*
await upload(db, 'db/actors.csv', `
copy actors (actor_id, stage_name, nationality, sex)
from stdin
with csv encoding 'UTF-8'
`);
console.log(`Uploaded to table actors`);
*/


await db.end();
console.log('Database successfully recreated.');