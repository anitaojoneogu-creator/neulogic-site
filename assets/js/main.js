// ---------- environment flags ----------
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = () => window.matchMedia('(max-width: 900px)').matches;

// ---------- header: transparent over hero -> frosted glass after threshold ----------
// Pages with a light hero carry .light-start and are frosted from load; no listener needed.
const header = document.getElementById('siteHeader');
if (header && !header.classList.contains('light-start')) {
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 70);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ---------- mobile nav ----------
const toggle = document.getElementById('navToggle');
const nav = document.getElementById('mainNav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
    if (header) header.classList.toggle('menu-open', open);
  });
  nav.querySelectorAll('.nav-item > button').forEach(btn => {
    btn.addEventListener('click', () => {
      if (isMobile()) {
        const item = btn.parentElement;
        const wasOpen = item.classList.contains('open');
        nav.querySelectorAll('.nav-item.open').forEach(i => i.classList.remove('open'));
        if (!wasOpen) item.classList.add('open');
      }
    });
  });
  nav.querySelectorAll('.dropdown a, .nav-item > a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    if (header) header.classList.remove('menu-open');
  }));
}

// ---------- scroll reveal (opacity + small translateY, staggered per group) ----------
// Applied via JS so content stays fully visible with JS disabled or reduced motion on.
if (!reducedMotion && 'IntersectionObserver' in window) {
  const revealSelectors = [
    '.section-head', '.feature-card', '.callout-card', '.testi-card', '.case-card',
    '.cert-card', '.step-card', '.article-card', '.sol-card', '.client-card',
    '.leader-card', '.proof-card', '.who-band', '.quote-card', '.form-card',
    '.sol-unit .img-ph', '.sol-stream > .sol-unit',
  ];
  const els = document.querySelectorAll(revealSelectors.join(','));
  const groups = new Map(); // parent -> running index for stagger
  els.forEach(el => {
    if (el.closest('.reveal')) return; // don't nest reveals
    el.classList.add('reveal');
    const parent = el.parentElement;
    const idx = groups.get(parent) || 0;
    groups.set(parent, idx + 1);
    el.style.transitionDelay = Math.min(idx * 70, 350) + 'ms';
  });
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

// ---------- parallax utility (transform-only, rAF-batched, IO-gated) ----------
// [data-parallax]        : hero background layer, moves at ~25% of scroll speed
// [data-drift]           : decorative image cards, drift a few px as they pass through
// Disabled entirely for reduced-motion users and on mobile viewports.
(function initParallax() {
  if (reducedMotion || isMobile()) return;
  const heroLayers = [...document.querySelectorAll('[data-parallax]')];
  const drifters = [...document.querySelectorAll('[data-drift]')];
  if (!heroLayers.length && !drifters.length) return;

  const visible = new Set();
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => e.isIntersecting ? visible.add(e.target) : visible.delete(e.target));
    schedule();
  }, { rootMargin: '10% 0px' });
  heroLayers.forEach(el => io.observe(el.parentElement));
  drifters.forEach(el => io.observe(el));

  let ticking = false;
  function schedule() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }
  function update() {
    ticking = false;
    const vh = window.innerHeight;
    heroLayers.forEach(el => {
      if (!visible.has(el.parentElement)) return;
      // background scrolls ~25% slower than foreground
      el.style.transform = 'translateY(' + (window.scrollY * 0.25).toFixed(1) + 'px)';
    });
    drifters.forEach(el => {
      if (!visible.has(el)) return;
      const r = el.getBoundingClientRect();
      // -1 (below viewport) .. +1 (above viewport)
      const progress = 1 - 2 * ((r.top + r.height / 2) / vh);
      el.style.transform = 'translateY(' + (progress * 14).toFixed(1) + 'px)';
    });
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  update();
})();

// ---------- testimonials: scroll-linked horizontal scroll ----------
// As the section passes through the viewport, the card row translates sideways
// in proportion to scroll progress. Transform-only, rAF-batched, IO-gated.
// Reduced motion leaves it as the CSS manual swipe strip (overflow-x:auto).
(function initHScroll() {
  if (reducedMotion) return;
  const viewport = document.getElementById('testiViewport');
  const track = document.getElementById('testiTrack');
  if (!viewport || !track) return;
  viewport.classList.add('js-hscroll');   // switch CSS from manual scroll to JS-driven

  let ticking = false, inView = false;
  const io = new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting;
    if (inView) schedule();
  }, { rootMargin: '0px' });
  io.observe(viewport);

  function schedule() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }
  function update() {
    ticking = false;
    const rect = viewport.getBoundingClientRect();
    const vh = window.innerHeight;
    const max = Math.max(0, track.scrollWidth - viewport.clientWidth);
    // progress: 0 as the section enters from the bottom, 1 as it leaves the top
    const total = vh + rect.height;
    let p = (vh - rect.top) / total;
    p = Math.max(0, Math.min(1, p));
    track.style.transform = 'translateX(' + (-p * max).toFixed(1) + 'px)';
  }
  window.addEventListener('scroll', () => { if (inView) schedule(); }, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  update();
})();

// ---------- filter bars (case studies, insights) ----------
document.querySelectorAll('[data-filter-bar]').forEach(bar => {
  const targetSel = bar.getAttribute('data-filter-target');
  const items = document.querySelectorAll(targetSel + ' [data-cat]');
  const empty = document.querySelector(targetSel + '-empty');
  bar.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      bar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-cat');
      let shown = 0;
      items.forEach(item => {
        const show = cat === 'all' || item.getAttribute('data-cat') === cat;
        item.style.display = show ? '' : 'none';
        if (show) shown++;
      });
      if (empty) empty.style.display = shown === 0 ? 'block' : 'none';
    });
  });
});

// ---------- demo request form — client-side only; wire to a real endpoint before launch ----------
const demoForm = document.getElementById('demoForm');
if (demoForm) {
  demoForm.addEventListener('submit', e => {
    e.preventDefault();
    demoForm.style.display = 'none';
    document.getElementById('demoSuccess').style.display = 'block';
  });
}

// ---------- newsletter forms — client-side only; wire to a real endpoint before launch ----------
document.querySelectorAll('.newsletter form').forEach(f => {
  f.addEventListener('submit', e => {
    e.preventDefault();
    f.innerHTML = '<p style="color:var(--orange);font-size:14px;">Thanks — you\'re signed up.</p>';
  });
});
