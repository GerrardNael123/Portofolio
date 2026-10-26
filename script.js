// script.js
const $ = (id) => document.getElementById(id);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Navbar + back to top
const navbar = $('navbar'), backToTop = $('backToTop');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  backToTop.classList.toggle('show', window.scrollY > 500);
}, { passive: true });
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

// Mobile menu
const hamburger = $('hamburger'), navLinks = $('navLinks');
function setMenu(open) {
  hamburger.classList.toggle('active', open);
  navLinks.classList.toggle('active', open);
  hamburger.setAttribute('aria-expanded', open);
}
hamburger.addEventListener('click', () => setMenu(!navLinks.classList.contains('active')));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

// Hero: jaringan node yang bereaksi pada kursor
(function network() {
  const canvas = $('net'), ctx = canvas.getContext('2d');
  let w, h, pts = [], mouse = { x: -999, y: -999 };
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    w = canvas.offsetWidth; h = canvas.offsetHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(80, Math.floor(w * h / 14000));
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35
    }));
  }
  function frame() {
    ctx.clearRect(0, 0, w, h);
    for (const p of pts) {
      if (!reduceMotion) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }
    }
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      ctx.fillStyle = 'rgba(123,140,255,.8)';
      ctx.beginPath(); ctx.arc(a.x, a.y, 2, 0, 6.283); ctx.fill();
      for (let j = i + 1; j < pts.length; j++) {
        const b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 130) {
          ctx.strokeStyle = `rgba(123,140,255,${.22 * (1 - d / 130)})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
      if (dm < 170) {
        ctx.strokeStyle = `rgba(255,184,107,${.6 * (1 - dm / 170)})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
    }
    if (!reduceMotion) requestAnimationFrame(frame);
  }
  window.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
  });
  window.addEventListener('resize', () => { resize(); if (reduceMotion) frame(); });
  resize(); frame();
})();

// Project GitHub otomatis (dengan cache sesi)
const GITHUB_USERNAME = 'GerrardNael123';
const grid = $('projectsGrid');

function el(tag, props = {}, ...kids) {
  const n = Object.assign(document.createElement(tag), props);
  n.append(...kids);
  return n;
}
function render(repos) {
  grid.replaceChildren();
  if (!repos.length) { grid.append(el('p', { className: 'loading-text', textContent: 'Belum ada repository publik.' })); return; }
  repos.forEach(r => {
    const meta = el('div', { className: 'project-meta' });
    if (r.language) meta.append(el('span', { className: 'badge', textContent: r.language }));
    meta.append(el('span', { className: 'badge', textContent: '★ ' + r.stargazers_count }));
    grid.append(el('div', { className: 'project-card' },
      el('h3', { textContent: r.name }),
      el('p', { textContent: r.description || 'Tidak ada deskripsi.' }),
      meta,
      el('a', { className: 'project-link', href: r.html_url, target: '_blank', rel: 'noopener', textContent: 'Lihat di GitHub' })
    ));
  });
}
async function loadProjects() {
  try {
    let repos;
    try { repos = JSON.parse(sessionStorage.getItem('repos')); } catch { repos = null; }
    if (!repos) {
      const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`);
      if (!res.ok) throw new Error('Gagal mengambil data GitHub');
      const all = (await res.json()).filter(r => !r.fork);
      try { sessionStorage.setItem('repoTotal', all.length); } catch {}
      repos = all
        .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.pushed_at) - new Date(a.pushed_at))
        .slice(0, 6);
      try { sessionStorage.setItem('repos', JSON.stringify(repos)); } catch {}
    }
    render(repos);
    countUp($('statRepo'), +(sessionStorage.getItem('repoTotal') || repos.length));
  } catch (err) {
    grid.replaceChildren(el('p', { className: 'loading-text', textContent: 'Project tidak bisa dimuat. Coba muat ulang halaman.' }));
    console.error(err);
  }
}
loadProjects();
// Sertifikat
// Untuk menambah sertifikat: taruh file di images/sertifikat/, lalu tambahkan satu objek di bawah.
// image = versi penuh (dibuka saat diklik), thumb = versi kecil untuk grid (opsional).
const CERTIFICATES = [
  {
    title: 'Panitia FTI Open House 2026',
    role: 'Anggota Divisi Perlengkapan dan Konsumsi',
    issuer: 'DPM FTI Universitas Tarumanagara',
    year: 2026,
    category: 'Kepanitiaan',
    image: 'sertifikat/Sertifikat Panitia OH.png',
    thumb: 'sertifikat/Sertifikat Panitia OH.png',
    verifyUrl: ''
  },
  {
    title: 'Self-Paced Azure AI Basic Fundamental',
    role: '',
    issuer: 'GreatNusa',
    year: 2026,
    category: 'Kursus',
    image: 'sertifikat/Sertifikat Azure AI.png',
    thumb: 'sertifikat/Sertifikat Azure AI.png',
    verifyUrl: ''
  },
  {
    title: 'Pelatihan Azure AI Fundamentals: "Microsoft AI-900T00-A Belajar AI dari Dasar"',
    role: '',
    issuer: 'GreatNusa',
    year: 2026,
    category: 'Kursus',
    image: 'sertifikat/Sertifikat GreatNusa.png',
    thumb: 'sertifikat/Sertifikat GreatNusa.png',
    verifyUrl: ''
  }
];

(function certificates() {
  const gridEl = $('certGrid'), filtersEl = $('certFilters'), dlg = $('certDialog');
  const all = [...CERTIFICATES].sort((a, b) => b.year - a.year);
  let active = 'Semua', list = all, idx = 0;

  function renderFilters() {
    const cats = [...new Set(all.map(c => c.category))];
    filtersEl.hidden = cats.length < 2;
    if (filtersEl.hidden) return;
    filtersEl.replaceChildren(...['Semua', ...cats].map(name => {
      const count = name === 'Semua' ? all.length : all.filter(c => c.category === name).length;
      const b = el('button', {
        type: 'button', className: 'cert-filter', textContent: `${name} (${count})`,
        onclick: () => { active = name; renderFilters(); renderGrid(); }
      });
      b.setAttribute('aria-pressed', String(name === active));
      return b;
    }));
  }

  function renderGrid() {
    list = active === 'Semua' ? all : all.filter(c => c.category === active);
    gridEl.replaceChildren(...list.map((c, i) => {
      const thumb = el('span', { className: 'cert-thumb' },
        el('img', { src: c.thumb || c.image, alt: `Sertifikat ${c.title} dari ${c.issuer}`, loading: 'lazy', decoding: 'async' }));
      const tags = el('span', { className: 'cert-tags' },
        el('span', { className: 'badge', textContent: c.category }),
        el('span', { className: 'badge', textContent: String(c.year) }));
      const card = el('button', { type: 'button', className: 'cert-card', onclick: () => openAt(i) },
        thumb,
        el('span', { className: 'cert-title', textContent: c.title }),
        el('span', { className: 'cert-issuer', textContent: c.issuer }),
        tags);
      return el('li', {}, card);
    }));
  }

    function show(i) {
    idx = (i + list.length) % list.length;
    const c = list[idx], img = $('certImg');
    img.src = c.image;
    img.alt = `Sertifikat ${c.title} dari ${c.issuer}`;
    $('certTitle').textContent = c.title;
    $('certSub').textContent = `${c.role ? c.role + ', ' : ''}${c.issuer}, ${c.year}`;
    $('certDesc').textContent = c.description || '';
    $('certNav').hidden = list.length < 2;
    $('certCount').textContent = `${idx + 1} dari ${list.length}`;
  }
  function openAt(i) {
    show(i);
    document.body.classList.add('modal-open');
    dlg.showModal();
  }

  $('certClose').addEventListener('click', () => dlg.close());
  $('certPrev').addEventListener('click', () => show(idx - 1));
  $('certNext').addEventListener('click', () => show(idx + 1));
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', () => document.body.classList.remove('modal-open'));
  dlg.addEventListener('keydown', (e) => {
    if (list.length < 2) return;
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });

  renderFilters();
  renderGrid();
})();

/* ===== Interaksi tambahan ===== */
function countUp(node, target) {
  if (!node) return;
  if (reduceMotion || target === 0) { node.textContent = target; return; }
  const t0 = performance.now(), dur = 1100;
  (function tick(t) {
    const p = Math.min((t - t0) / dur, 1);
    node.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}

(function enhance() {
  const bar = $('progress');
  const upd = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  };
  addEventListener('scroll', upd, { passive: true }); upd();

  const links = [...navLinks.querySelectorAll('a')];
  const spy = new IntersectionObserver((es) => es.forEach(e => {
    if (!e.isIntersecting) return;
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main section[id]').forEach(s => spy.observe(s));

  const certTotal = CERTIFICATES.length;
  const skillTotal = document.querySelectorAll('.skill-group li').length;
  const REVEAL = '.sec h2, .prose p, .stats > div, .skill-group, .skill-group li, .featured, .sub, .project-card, .cert-grid > li, .contact-lead, .contact-mail, .copy-btn, .contact-links';
  const io = new IntersectionObserver((es) => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in'); io.unobserve(e.target);
    const dd = e.target.querySelector && e.target.querySelector('#statCert, #statSkill');
    if (dd) countUp(dd, dd.id === 'statCert' ? certTotal : skillTotal);
  }), { threshold: .15 });
  function watch(root) {
    root.querySelectorAll(REVEAL).forEach(n => {
      if (n.dataset.rv) return;
      n.dataset.rv = 1; n.classList.add('rv');
      n.style.setProperty('--d', Math.min([...n.parentElement.children].indexOf(n), 8) * 70 + 'ms');
      io.observe(n);
    });
  }
  if (reduceMotion) {
    document.documentElement.classList.remove('js');
    $('statCert').textContent = certTotal; $('statSkill').textContent = skillTotal;
  } else {
    watch(document);
    ['projectsGrid', 'certGrid'].forEach(id => new MutationObserver(() => watch($(id))).observe($(id), { childList: true }));
  }

  document.addEventListener('pointermove', (e) => {
    const c = e.target.closest && e.target.closest('.skill-group, .project-card, .featured, .cert-thumb');
    if (!c) return;
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', e.clientX - r.left + 'px');
    c.style.setProperty('--my', e.clientY - r.top + 'px');
  }, { passive: true });

  const toast = $('toast');
  $('copyMail').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText('gerrard.nael@gmail.com'); toast.textContent = 'Email disalin'; }
    catch { toast.textContent = 'Gagal menyalin, silakan salin manual'; }
    toast.classList.add('show'); clearTimeout(toast.t);
    toast.t = setTimeout(() => toast.classList.remove('show'), 1800);
  });
})();