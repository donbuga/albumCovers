const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MusicBrainz proxy endpoint
app.get('/api/musicbrainz/*', async (req, res) => {
  try {
    const musicBrainzUrl = `https://musicbrainz.org/ws/2/${req.params[0]}`;
    const queryString = new URL(req.url, `http://localhost:${PORT}`).search;
    const fullUrl = musicBrainzUrl + queryString;

    console.log('Proxying request to:', fullUrl);

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AlbumCoversExplorer/1.0.0',
        'X-Client-Name': 'AlbumCoversExplorer/1.0.0',
      },
    });

    if (!response.ok) {
      console.error('MusicBrainz response status:', response.status);
      return res.status(response.status).json({ error: `MusicBrainz responded with status ${response.status}` });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`MusicBrainz proxy server running on http://localhost:${PORT}`);
});
