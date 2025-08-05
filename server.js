const express = require('express');
const WebTorrent = require('webtorrent');
const app = express();
const client = new WebTorrent();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

app.post('/add-torrent', (req, res) => {
  const { magnet } = req.body;
  if (!magnet) return res.status(400).send('Magnet link is required.');

  client.add(magnet, (torrent) => {
    console.log(`Started downloading: ${torrent.name}`);
    res.json({ name: torrent.name, files: torrent.files.map(f => f.name) });
  });
});

app.get('/stream/:filename', (req, res) => {
  const fileName = req.params.filename;
  const torrent = client.torrents.find(t => t.files.find(f => f.name === fileName));
  if (!torrent) return res.status(404).send('File not found.');

  const file = torrent.files.find(f => f.name === fileName);
  res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
  file.createReadStream().pipe(res);
});

app.listen(port, () => console.log(`Server running on port ${port}`));
