/* ── CONFIG ─────────────────────────────────────────── */
const CFG = {
  bioText:      'Les liens utiles',
  discordTag:   'grimpeaks.',
  anilistUser:  'Grimpeaks',
  // Spotify Now Playing : configurez un proxy qui renvoie { is_playing, track, artist }
  // Exemple avec Vercel : déployez api/spotify.js et mettez l'URL ici
  spotify: null,
};

/* ── PARTICLES ──────────────────────────────────────── */
(function () {
  const c = document.getElementById('pts');
  for (let i = 0; i < 28; i++) {
    const p = document.createElement('div');
    p.className = 'pt';
    const s = Math.random() * 3.5 + 1.5;
    p.style.cssText = `
      left:${Math.random()*100}%;
      width:${s}px; height:${s}px;
      animation-duration:${Math.random()*16+10}s;
      animation-delay:${Math.random()*-25}s;
      opacity:${Math.random()*.45+.15};
    `;
    c.appendChild(p);
  }
})();

/* ── TOAST ──────────────────────────────────────────── */
(function () {
  const el = document.getElementById('toast');
  let _t;
  window._showToast = function (msg) {
    if (!el) return;
    clearTimeout(_t);
    el.textContent = msg;
    el.classList.add('show');
    _t = setTimeout(() => el.classList.remove('show'), 2400);
  };
})();

/* ── TYPEWRITER BIO ─────────────────────────────────── */
(function () {
  const el = document.getElementById('bio');
  if (!el) return;
  const text = CFG.bioText;
  let i = 0;
  el.textContent = '';
  setTimeout(function type() {
    if (i < text.length) {
      el.textContent += text[i++];
      setTimeout(type, 55 + Math.random() * 35);
    }
  }, 950);
})();

/* ── REAL-TIME CLOCK ────────────────────────────────── */
(function () {
  const el = document.getElementById('clock');
  if (!el) return;
  function tick() {
    const n = new Date();
    const h = String(n.getHours()).padStart(2, '0');
    const m = String(n.getMinutes()).padStart(2, '0');
    const s = String(n.getSeconds()).padStart(2, '0');
    el.textContent = `${h}:${m}:${s}`;
  }
  tick();
  setInterval(tick, 1000);
})();

/* ── STAGGERED LINK REVEAL ──────────────────────────── */
(function () {
  document.querySelectorAll('.links .lnk').forEach((lnk, i) => {
    setTimeout(() => lnk.classList.add('revealed'), 980 + i * 130);
  });
})();

/* ── DISCORD COPY TOAST ─────────────────────────────── */
(function () {
  const lnk = document.querySelector('[data-copy]');
  if (!lnk) return;
  lnk.addEventListener('click', () => {
    const tag = lnk.dataset.copy;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(tag)
        .then(() => window._showToast('Tag Discord copié ! 📋'))
        .catch(() => {});
    }
  });
})();

/* ── MUSIC PLAYER ───────────────────────────────────── */
(function () {
  const audio = document.getElementById('audio');
  const fill  = document.getElementById('plFill');
  const bar   = document.getElementById('plBar');
  const cur   = document.getElementById('plCur');
  const dur   = document.getElementById('plDur');
  const ico   = document.getElementById('plIco');
  const art   = document.getElementById('plArt');
  const btnP  = document.getElementById('btnPlay');

  const PLAY_D  = 'M8 5v14l11-7z';
  const PAUSE_D = 'M6 19h4V5H6v14zm8-14v14h4V5h-4z';

  function fmt(s) {
    if (!s || isNaN(s)) return '0:00';
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  }

  function setPlayingUI(on) {
    ico.setAttribute('d', on ? PAUSE_D : PLAY_D);
    btnP.setAttribute('aria-label', on ? 'Pause' : 'Lecture');
    on ? art.classList.add('spinning') : art.classList.remove('spinning');
  }

  audio.addEventListener('timeupdate', () => {
    const t = audio.currentTime;
    const d = audio.duration || 0;
    fill.style.width = d ? (t / d * 100) + '%' : '0%';
    bar.setAttribute('aria-valuenow', Math.round(t));
    bar.setAttribute('aria-valuemax', Math.round(d));
    cur.textContent = fmt(t);
  });

  audio.addEventListener('loadedmetadata', () => {
    if (dur) dur.textContent = fmt(audio.duration);
  });

  audio.addEventListener('ended', () => setPlayingUI(false));

  function bootAudio() {
    audio.volume = 0.01;
    audio.play().catch(() => {});
  }
  if (audio.readyState >= 3) {
    bootAudio();
  } else {
    audio.addEventListener('canplay', function start() {
      bootAudio();
      audio.removeEventListener('canplay', start);
    });
  }

  function onFirstInteraction() {
    audio.muted = false;
    audio.volume = 0.01;
    if (audio.paused) {
      audio.play().then(() => setPlayingUI(true)).catch(() => {});
    } else {
      setPlayingUI(true);
    }
    ['click','keydown','touchstart','scroll'].forEach(e =>
      document.removeEventListener(e, onFirstInteraction)
    );
  }
  ['click','keydown','touchstart','scroll'].forEach(e =>
    document.addEventListener(e, onFirstInteraction, { once: false, passive: true })
  );

  btnP.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().then(() => setPlayingUI(true)).catch(() => {});
    } else {
      audio.pause();
      setPlayingUI(false);
    }
  });

  document.getElementById('btnPrev').addEventListener('click', () => {
    audio.currentTime = Math.max(0, audio.currentTime - 10);
  });

  document.getElementById('btnNext').addEventListener('click', () => {
    audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10);
  });

  bar.addEventListener('click', e => {
    if (!audio.duration) return;
    const r = bar.getBoundingClientRect();
    audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
  });

  bar.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 5);
    if (e.key === 'ArrowLeft')  audio.currentTime = Math.max(0, audio.currentTime - 5);
  });

})();

/* ── CUSTOM CURSOR + TRAIL ──────────────────────────── */
(function () {
  const dot  = document.getElementById('cur-dot');
  const ring = document.getElementById('cur-ring');
  if (!dot || !ring) return;

  let mx = -200, my = -200;
  let rx = -200, ry = -200;
  let _lastTrail = 0;
  const isFine = window.matchMedia('(pointer: fine)').matches;

  function spawnTrail(x, y) {
    if (!isFine) return;
    const now = Date.now();
    if (now - _lastTrail < 38) return;
    _lastTrail = now;
    const t = document.createElement('div');
    t.className = 'cur-trail';
    const s = Math.random() * 5 + 3;
    t.style.cssText = `left:${x}px;top:${y}px;width:${s}px;height:${s}px;`;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 580);
  }

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
    spawnTrail(mx, my);
  });

  (function loop() {
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  })();

  const SEL = 'a, button, [role="progressbar"], input, label, [tabindex]';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(SEL)) document.body.classList.add('cur-hov');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(SEL)) document.body.classList.remove('cur-hov');
  });

  document.addEventListener('mousedown', () => document.body.classList.add('cur-clk'));
  document.addEventListener('mouseup',   () => document.body.classList.remove('cur-clk'));

  const COLORS = ['#c084fc','#a78bfa','#e879f9','#fff','#818cf8'];
  document.addEventListener('click', e => {
    const n = 7;
    for (let i = 0; i < n; i++) {
      const sp    = document.createElement('div');
      sp.className = 'cur-sp';
      const angle = (i / n) * 360 + Math.random() * 22;
      const dist  = Math.random() * 32 + 16;
      const col   = COLORS[Math.floor(Math.random() * COLORS.length)];
      const size  = Math.random() * 4 + 3;
      sp.style.cssText = `
        left:${e.clientX}px; top:${e.clientY}px;
        --tx:${Math.cos(angle * Math.PI/180) * dist}px;
        --ty:${Math.sin(angle * Math.PI/180) * dist}px;
        width:${size}px; height:${size}px;
        background:${col};
        box-shadow: 0 0 6px ${col};
      `;
      document.body.appendChild(sp);
      setTimeout(() => sp.remove(), 600);
    }
  });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });
})();

/* ── VOLUME CONTROL ─────────────────────────────────── */
(function () {
  const audio  = document.getElementById('audio');
  const btn    = document.getElementById('volBtn');
  const panel  = document.getElementById('vol-panel');
  const range  = document.getElementById('vol-range');
  const pct    = document.getElementById('vol-pct');
  const ico    = document.getElementById('volIco');

  const ICONS = {
    high: `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
           <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
           <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>`,
    low:  `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
           <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>`,
    mute: `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
           <line x1="23" y1="9" x2="17" y2="15"/>
           <line x1="17" y1="9" x2="23" y2="15"/>`
  };

  function updateIcon(vol) {
    ico.innerHTML = vol === 0 ? ICONS.mute : vol < 0.5 ? ICONS.low : ICONS.high;
  }

  function setVolume(v) {
    v = Math.max(0, Math.min(1, v));
    audio.volume = v;
    range.value  = Math.round(v * 100);
    pct.textContent = Math.round(v * 100) + '%';
    range.setAttribute('aria-valuetext', Math.round(v * 100) + '%');
    updateIcon(v);
  }

  btn.addEventListener('click', e => {
    e.stopPropagation();
    const open = panel.classList.toggle('hidden');
    btn.setAttribute('aria-expanded', String(!open));
    btn.classList.toggle('active', !open);
  });

  document.addEventListener('click', e => {
    if (!panel.classList.contains('hidden') &&
        !panel.contains(e.target) && e.target !== btn) {
      panel.classList.add('hidden');
      btn.setAttribute('aria-expanded', 'false');
      btn.classList.remove('active');
    }
  });

  range.addEventListener('input', () => setVolume(range.value / 100));

  btn.addEventListener('wheel', e => {
    e.preventDefault();
    setVolume(audio.volume + (e.deltaY < 0 ? 0.05 : -0.05));
  }, { passive: false });

  panel.addEventListener('wheel', e => {
    e.preventDefault();
    setVolume(audio.volume + (e.deltaY < 0 ? 0.05 : -0.05));
  }, { passive: false });

  setVolume(0.01);
})();

/* ── ANILIST API ────────────────────────────────────── */
(function () {
  const q = `{ User(name: "${CFG.anilistUser}") { statistics { anime { count meanScore episodesWatched } } } }`;
  fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ query: q })
  })
  .then(r => r.json())
  .then(d => {
    const a = d.data.User.statistics.anime;
    const score = a.meanScore ? (a.meanScore / 10).toFixed(1) : '—';
    const eps   = a.episodesWatched >= 1000
      ? (a.episodesWatched / 1000).toFixed(1) + 'k'
      : String(a.episodesWatched);
    document.getElementById('aniCount').textContent = a.count;
    document.getElementById('aniScore').textContent = score;
    document.getElementById('aniEps').textContent   = eps;
    document.getElementById('aniStats').classList.add('loaded');
  })
  .catch(() => {
    document.getElementById('aniStats').classList.add('loaded');
  });
})();

/* ── SPOTIFY NOW PLAYING ────────────────────────────── */
/* Nécessite un proxy côté serveur.
   Configurez CFG.spotify avec l'URL de votre proxy.
   Votre proxy doit retourner : { is_playing: bool, track: string, artist: string }
   Exemple de proxy Vercel : voir api/spotify.js */
(function () {
  if (!CFG.spotify) return;
  const el = document.getElementById('spNow');

  function poll() {
    fetch(CFG.spotify)
      .then(r => r.json())
      .then(d => {
        if (d.is_playing) {
          document.getElementById('spTrack').textContent  = d.track  || '—';
          document.getElementById('spArtist').textContent = d.artist || '—';
          el.classList.add('visible');
        } else {
          el.classList.remove('visible');
        }
      })
      .catch(() => el.classList.remove('visible'));
  }

  poll();
  setInterval(poll, 30000);
})();

/* ── VISITOR COUNTER ────────────────────────────────── */
(function () {
  const el  = document.getElementById('visitCount');
  const num = document.getElementById('visitNum');
  if (!el || !num) return;
  fetch('https://api.counterapi.dev/v1/grimpeaks/mygunslol/up')
    .then(r => r.json())
    .then(d => {
      if (d && typeof d.count === 'number') {
        num.textContent = d.count.toLocaleString('fr-FR');
        el.classList.add('visible');
      }
    })
    .catch(() => {});
})();
