import express from 'express';
const app = express();
const port = process.env.PORT || 3004;

app.get('/', (req, res) => {
  res.send('Miner Tracker Bot is alive!');
});

let server;

export function keepAlive() {
  if (!server) {
    server = app.listen(port, () => {
      console.log("Server is ready on port", port);
    });
  }
} 