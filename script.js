/* ── CONFIG ─────────────────────────────────────────── */
const CFG = {
  bioText:      'Les liens utiles',
  discordTag:   'grimpeaks.',
  anilistUser:  'Grimpeaks',
  bgImages: [
    'src/background.jpg',
    // Ajoute tes photos ici :
    // 'src/bg2.jpg',
    // 'src/bg3.jpg',
  ],
  bgDelay: 8000,   // ms entre chaque changement
  bgFade:  1400,   // ms de durée du fondu
};

/* ── TRACKS ─────────────────────────────────────────── */
const TRACKS = [
  { src: 'src/dream.mp3',  title: '(Dream)',  artist: 'Salvia Palth', cover: 'src/cover.jpg'  },
  { src: 'src/pool-stripped.mp3', title: 'Pool Stripped', artist: 'Samia', cover: 'src/cover2.jpg' },
  { src: 'src/My-Love-Mine-All-Mine.mp3', title: 'My Love Mine All Mine', artist: 'Mitski', cover: 'src/cover3.jpg' },
];

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

/* ── BACKGROUND SLIDESHOW ───────────────────────────── */
(function () {
  const imgs = (CFG.bgImages || []).filter(Boolean);
  if (imgs.length < 2) return;
  const el = document.getElementById('bg-img');
  if (!el) return;

  const delay = CFG.bgDelay || 8000;
  const fade  = CFG.bgFade  || 1400;
  let idx = 0;

  function preload(src) { const i = new Image(); i.src = src; }
  preload(imgs[1]);

  setInterval(() => {
    el.style.opacity = '0';
    setTimeout(() => {
      idx = (idx + 1) % imgs.length;
      el.style.backgroundImage = `url('${imgs[idx]}')`;
      preload(imgs[(idx + 1) % imgs.length]);
      el.style.opacity = '1';
    }, fade);
  }, delay);
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

  window._setPlayingUI = setPlayingUI;
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
  const q = `{
    User(name: "${CFG.anilistUser}") {
      statistics {
        anime { count meanScore episodesWatched minutesWatched }
        manga { count meanScore chaptersRead volumesRead }
      }
      favourites {
        anime      { nodes { id title { romaji english } coverImage { medium } } }
        manga      { nodes { id title { romaji english } coverImage { medium } } }
        characters { nodes { id name { full } image { medium } } }
      }
    }
    currentAnime: MediaListCollection(userName: "${CFG.anilistUser}", type: ANIME, status: CURRENT) {
      lists { entries { media { id title { romaji english } coverImage { medium } } progress } }
    }
    currentManga: MediaListCollection(userName: "${CFG.anilistUser}", type: MANGA, status: CURRENT) {
      lists { entries { media { id title { romaji english } coverImage { medium } } progress } }
    }
    allAnimeScores: MediaListCollection(userName: "${CFG.anilistUser}", type: ANIME) {
      lists { entries { mediaId score } }
    }
    allMangaScores: MediaListCollection(userName: "${CFG.anilistUser}", type: MANGA) {
      lists { entries { mediaId score } }
    }
  }`;

  /* pre-fill containers with loading text */
  ['favAnime','favManga','favChara','curAnime','curManga'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '<div class="fav-empty">Chargement…</div>';
  });

  function buildScoreMap(collection) {
    const map = new Map();
    if (!collection) return map;
    collection.lists.forEach(list =>
      list.entries.forEach(e => { if (e.score) map.set(e.mediaId, e.score); })
    );
    return map;
  }

  function renderFavs(nodes, containerId, type, scoresMap) {
    const el = document.getElementById(containerId);
    if (!el) return;
    if (!nodes || nodes.length === 0) {
      el.innerHTML = '<div class="fav-empty">Aucun favori</div>';
      return;
    }
    el.innerHTML = nodes.map(n => {
      const img  = type === 'character' ? n.image.medium : n.coverImage.medium;
      const name = type === 'character'
        ? n.name.full
        : (n.title.romaji || n.title.english || '');
      const url  = type === 'anime'     ? `https://anilist.co/anime/${n.id}`
                 : type === 'manga'     ? `https://anilist.co/manga/${n.id}`
                 :                        `https://anilist.co/character/${n.id}`;
      const cls  = type === 'character' ? 'fav-cover fav-cover-sq' : 'fav-cover';
      const score = scoresMap && scoresMap.has(n.id) ? scoresMap.get(n.id) : 0;
      const scoreBadge = (score && type !== 'character')
        ? `<div class="fav-score">★ ${score}</div>`
        : '';
      return `<a href="${url}" class="fav-card" target="_blank" rel="noopener noreferrer" title="${name}">
        <img class="${cls}" src="${img}" alt="${name}" loading="lazy" onerror="this.style.opacity='.25'">
        ${scoreBadge}
        <div class="fav-name">${name}</div>
      </a>`;
    }).join('');
  }

  function renderCurrent(entries, containerId, type) {
    const el = document.getElementById(containerId);
    if (!el) return;
    if (!entries || entries.length === 0) {
      el.innerHTML = '<div class="fav-empty">Rien en cours</div>';
      return;
    }
    el.innerHTML = entries.map(e => {
      const m    = e.media;
      const name = m.title.romaji || m.title.english || '';
      const url  = `https://anilist.co/${type}/${m.id}`;
      const prog = type === 'anime' ? `Ép. ${e.progress}` : `Ch. ${e.progress}`;
      return `<a href="${url}" class="fav-card" target="_blank" rel="noopener noreferrer" title="${name}">
        <img class="fav-cover" src="${m.coverImage.medium}" alt="${name}" loading="lazy" onerror="this.style.opacity='.25'">
        <div class="fav-prog">${prog}</div>
        <div class="fav-name">${name}</div>
      </a>`;
    }).join('');
  }

  fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ query: q })
  })
  .then(r => r.json())
  .then(d => {
    const s = d.data.User.statistics;
    const a = s.anime;
    const m = s.manga;

    /* stats — anime */
    const aScore = a.meanScore ? (a.meanScore / 10).toFixed(1) : '—';
    const aEps   = a.episodesWatched >= 1000
      ? (a.episodesWatched / 1000).toFixed(1) + 'k'
      : String(a.episodesWatched);
    const aDays  = a.minutesWatched
      ? (Math.round(a.minutesWatched / 60 / 24 * 10) / 10) + 'j'
      : '—';
    document.getElementById('aniCount').textContent = a.count;
    document.getElementById('aniScore').textContent = aScore;
    document.getElementById('aniEps').textContent   = aEps;
    document.getElementById('aniDays').textContent  = aDays;

    /* stats — manga */
    const mScore = m.meanScore ? (m.meanScore / 10).toFixed(1) : '—';
    const mChaps = m.chaptersRead >= 1000
      ? (m.chaptersRead / 1000).toFixed(1) + 'k'
      : String(m.chaptersRead);
    document.getElementById('mangaCount').textContent = m.count;
    document.getElementById('mangaScore').textContent = mScore;
    document.getElementById('mangaChaps').textContent = mChaps;
    document.getElementById('mangaVols').textContent  = m.volumesRead;

    /* favourites with scores */
    const animeScoreMap = buildScoreMap(d.data.allAnimeScores);
    const mangaScoreMap = buildScoreMap(d.data.allMangaScores);
    const f = d.data.User.favourites;
    renderFavs(f.anime.nodes,      'favAnime', 'anime',      animeScoreMap);
    renderFavs(f.manga.nodes,      'favManga', 'manga',      mangaScoreMap);
    renderFavs(f.characters.nodes, 'favChara', 'character',  null);

    /* currently watching/reading */
    const flatEntries = col => col ? col.lists.flatMap(l => l.entries) : [];
    renderCurrent(flatEntries(d.data.currentAnime), 'curAnime', 'anime');
    renderCurrent(flatEntries(d.data.currentManga), 'curManga', 'manga');
  })
  .catch(() => {
    ['favAnime','favManga','favChara','curAnime','curManga'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = '<div class="fav-empty">Erreur de chargement</div>';
    });
  });
})();

/* ── ANILIST VIEW SWITCH + TABS ─────────────────────── */
(function () {
  const viewLinks    = document.getElementById('viewLinks');
  const viewAnilist  = document.getElementById('viewAnilist');
  const lnkAnilist   = document.getElementById('lnkAnilist');
  const backBtn      = document.getElementById('backBtn');
  if (!viewLinks || !viewAnilist || !lnkAnilist || !backBtn) return;

  /* ── view transitions ── */
  function showAnilist() {
    viewLinks.style.opacity = '0';
    viewLinks.style.pointerEvents = 'none';
    setTimeout(() => {
      viewLinks.style.display = 'none';
      viewAnilist.classList.add('ani-active');
      requestAnimationFrame(() => requestAnimationFrame(() => {
        viewAnilist.classList.add('ani-visible');
      }));
    }, 270);
  }

  function showLinks() {
    viewAnilist.classList.remove('ani-visible');
    setTimeout(() => {
      viewAnilist.classList.remove('ani-active');
      viewLinks.style.display = '';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        viewLinks.style.opacity = '';
        viewLinks.style.pointerEvents = '';
      }));
    }, 285);
  }

  lnkAnilist.addEventListener('click', e => { e.preventDefault(); showAnilist(); });
  backBtn.addEventListener('click', showLinks);

  /* ── main tabs: Stats / En cours / Favoris ── */
  const mainTabs   = ['tabStats','tabEnCours','tabFavoris'].map(id => document.getElementById(id));
  const mainPanels = ['panelStats','panelEnCours','panelFavoris'].map(id => document.getElementById(id));

  function fadeSwap(hide, show) {
    hide.style.opacity = '0';
    setTimeout(() => {
      hide.style.display = 'none';
      show.style.display = '';
      show.style.opacity = '0';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        show.style.opacity = '1';
      }));
    }, 180);
  }

  mainTabs.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('active')) return;
      mainTabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const current = mainPanels.find(p => p.style.display !== 'none');
      if (current) fadeSwap(current, mainPanels[i]);
      else { mainPanels[i].style.display = ''; mainPanels[i].style.opacity = '1'; }
    });
  });

  /* ── stats subtabs: Anime / Manga ── */
  const tabAnime  = document.getElementById('tabAnime');
  const tabManga  = document.getElementById('tabManga');
  const gridAnime = document.getElementById('gridAnime');
  const gridManga = document.getElementById('gridManga');

  tabAnime.addEventListener('click', () => {
    if (tabAnime.classList.contains('active')) return;
    tabAnime.classList.add('active');
    tabManga.classList.remove('active');
    fadeSwap(gridManga, gridAnime);
  });
  tabManga.addEventListener('click', () => {
    if (tabManga.classList.contains('active')) return;
    tabManga.classList.add('active');
    tabAnime.classList.remove('active');
    fadeSwap(gridAnime, gridManga);
  });

  /* ── en cours subtabs: Anime / Manga ── */
  const curTabs   = ['curTabAnime','curTabManga'].map(id => document.getElementById(id));
  const curPanels = ['curAnime',   'curManga'   ].map(id => document.getElementById(id));

  curTabs.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('active')) return;
      curTabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const current = curPanels.find(p => p.style.display !== 'none');
      if (current) fadeSwap(current, curPanels[i]);
      else { curPanels[i].style.display = ''; curPanels[i].style.opacity = '1'; }
    });
  });

  /* ── fav subtabs: Anime / Manga / Perso ── */
  const favTabs    = ['favTabAnime','favTabManga','favTabChara'].map(id => document.getElementById(id));
  const favPanels  = ['favAnime',   'favManga',   'favChara'  ].map(id => document.getElementById(id));

  favTabs.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('active')) return;
      favTabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const current = favPanels.find(p => p.style.display !== 'none');
      if (current) fadeSwap(current, favPanels[i]);
      else { favPanels[i].style.display = ''; favPanels[i].style.opacity = '1'; }
    });
  });
})();

/* ── FAV SCROLL DESKTOP ──────────────────────────────── */
(function () {
  document.querySelectorAll('.fav-scroll').forEach(el => {
    el.addEventListener('wheel', e => {
      if (e.deltaY === 0) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY * 0.9;
    }, { passive: false });

    let down = false, startX = 0, startScroll = 0, moved = false;
    el.addEventListener('mousedown', e => {
      down = true; moved = false;
      startX = e.clientX; startScroll = el.scrollLeft;
    });

    window.addEventListener('mousemove', e => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      if (moved) el.scrollLeft = startScroll - dx;
    });

    window.addEventListener('mouseup', () => { down = false; });

    el.addEventListener('click', e => {
      if (moved) { e.preventDefault(); moved = false; }
    }, true);
  });
})();

/* ── TRACK PANEL ─────────────────────────────────────── */
(function () {
  const plArt   = document.getElementById('plArt');
  const panel   = document.getElementById('trackPanel');
  const tpList  = document.getElementById('tpList');
  const tpClose = document.getElementById('tpClose');
  const audio   = document.getElementById('audio');
  const plCover = document.getElementById('plCover');
  if (!plArt || !panel || !tpList || TRACKS.length < 1) return;

  let currentIdx = 0;

  const NOTE_ICO = `<div class="tp-now"><svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg></div>`;

  /* build rows */
  TRACKS.forEach((t, i) => {
    const el = document.createElement('div');
    el.className = 'track-item' + (i === 0 ? ' tp-active' : '');
    el.innerHTML = `
      <img class="track-thumb" src="${t.cover}" alt="${t.title}" onerror="this.style.opacity='0'">
      <div class="track-info">
        <div class="track-name">${t.title}</div>
        <div class="track-artist">${t.artist}</div>
      </div>
      ${i === 0 ? NOTE_ICO : ''}`;
    el.addEventListener('click', () => switchTrack(i));
    tpList.appendChild(el);
  });

  function switchTrack(idx) {
    if (idx === currentIdx) { closePanel(); return; }
    const t = TRACKS[idx];
    const wasPlaying = !audio.paused;
    audio.src = t.src;
    audio.currentTime = 0;
    plCover.src = t.cover;
    plCover.style.opacity = '1';
    document.querySelector('.pl-title').textContent  = t.title;
    document.querySelector('.pl-artist').textContent = t.artist;

    tpList.querySelectorAll('.track-item').forEach((el, i) => {
      el.classList.toggle('tp-active', i === idx);
      const ico = el.querySelector('.tp-now');
      if (i === idx && !ico) el.insertAdjacentHTML('beforeend', NOTE_ICO);
      else if (i !== idx && ico) ico.remove();
    });

    currentIdx = idx;
    if (wasPlaying) {
      audio.play().then(() => window._setPlayingUI(true)).catch(() => {});
    } else {
      window._setPlayingUI(false);
    }
    closePanel();
  }

  function openPanel()  { panel.classList.remove('tp-hidden'); }
  function closePanel() { panel.classList.add('tp-hidden'); }

  plArt.addEventListener('click', e => {
    e.stopPropagation();
    panel.classList.contains('tp-hidden') ? openPanel() : closePanel();
  });

  if (tpClose) tpClose.addEventListener('click', closePanel);

  document.addEventListener('click', e => {
    if (!panel.classList.contains('tp-hidden') &&
        !panel.contains(e.target) && !plArt.contains(e.target)) {
      closePanel();
    }
  });
})();


