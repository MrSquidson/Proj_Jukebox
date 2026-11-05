# Mini Proj Jukebox
## Installation / Setup

1. Make a `.env` file that contains the following secrets to your remote NeonDB SQL server;
   ```
   PG_HOST=
   PG_PORT=5432
   PG_DATABASE=
   PG_USER=neondb_owner 
   PG_PASSWORD=
   ```
2. run `npm install` to install dependancies. 
3. Run `npm run qs` this runs the createDb.js file with node, and starts the server.js with nodemon.
4. Open the server in your browser on https://localhost:3002 or https://127.0.0.1:3002 

## Prototype Features
- Searching 
- Admin Panel
- Payment Panel
- Queue Panel
- Genre Filtering 
- Album Filtering
- Song list

## Missing
- Player
- Admin panel implementation
