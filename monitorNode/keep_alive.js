import express from 'express';
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Bot is alive!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

export function keepAlive() {
  app.listen(port, () => {
    console.log("Server is ready.");
  });
} 