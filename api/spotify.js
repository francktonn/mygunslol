// Vercel Serverless Function — Spotify Now Playing Proxy
// Variables d'env à configurer sur Vercel :
//   SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
    return res.status(500).json({ error: 'env vars missing' });
  }

  try {
    // 1. Rafraîchir l'access token
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64'),
      },
      body: new URLSearchParams({
        grant_type:    'refresh_token',
        refresh_token: SPOTIFY_REFRESH_TOKEN,
      }),
    });
    const { access_token } = await tokenRes.json();
    if (!access_token) return res.json({ is_playing: false });

    // 2. Récupérer le morceau en cours
    const nowRes = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (nowRes.status === 204 || nowRes.status >= 400) {
      return res.json({ is_playing: false });
    }

    const data = await nowRes.json();
    if (!data?.is_playing) return res.json({ is_playing: false });

    return res.json({
      is_playing: true,
      track:  data.item?.name || '—',
      artist: data.item?.artists?.map(a => a.name).join(', ') || '—',
    });
  } catch {
    return res.json({ is_playing: false });
  }
}
