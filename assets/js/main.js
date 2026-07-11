/* ============ RA Trading Academy — Interactions ============ */
(function () {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Preloader ---------- */
  const pre = document.getElementById('preloader');
  const preBar = document.getElementById('preBar');
  const preCount = document.getElementById('preCount');
  let p = 0;
  const load = setInterval(() => {
    p += Math.random() * 16;
    if (p >= 100) { p = 100; clearInterval(load); setTimeout(finish, 350); }
    if (preBar) preBar.style.width = p + '%';
    if (preCount) preCount.textContent = Math.floor(p);
  }, 120);

  function finish() {
    pre && pre.classList.add('done');
    document.body.style.overflow = '';
    heroIntro();
  }
  document.body.style.overflow = 'hidden';

  /* ---------- Year ---------- */
  const yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Custom cursor ---------- */
  const cursor = document.getElementById('cursor');
  const dot = document.getElementById('cursorDot');
  if (cursor && !reduce && window.matchMedia('(hover:hover)').matches) {
    let cx = 0, cy = 0, tx = 0, ty = 0;
    window.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; dot.style.transform = `translate(${tx}px,${ty}px) translate(-50%,-50%)`; });
    (function loop() { cx += (tx - cx) * 0.16; cy += (ty - cy) * 0.16; cursor.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`; requestAnimationFrame(loop); })();
    document.querySelectorAll('[data-hover],a,button').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('grow'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('grow'));
    });
  }

  /* ---------- Nav ---------- */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 40));
  const burger = document.getElementById('burger');
  const menu = document.getElementById('menu');
  burger && burger.addEventListener('click', () => { nav.classList.toggle('open'); menu.classList.toggle('open'); });
  menu && menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('open'); menu.classList.remove('open'); }));

  /* ---------- Scroll progress ---------- */
  const bar = document.getElementById('scrollProgress');
  window.addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (window.scrollY / h) * 100 + '%';
  });

  /* ---------- Split text into words ---------- */
  document.querySelectorAll('.split').forEach(el => {
    const words = el.textContent.trim().split(' ');
    el.innerHTML = words.map(w => {
      if (w === '') return ' ';
      return `<span class="word"><span>${w}</span></span> `;
    }).join('');
  });

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        if (window.gsap && e.target.classList.contains('split')) {
          gsap.to(e.target.querySelectorAll('.word>span'), { y: 0, duration: 1, ease: 'expo.out', stagger: 0.06 });
        }
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal,.split').forEach(el => io.observe(el));

  /* ---------- Hero intro ---------- */
  function heroIntro() {
    if (!window.gsap) return;
    const tl = gsap.timeline();
    tl.to('.hero__title .line>span', { y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.09 })
      .to('.hero .reveal', { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08 }, '-=0.7');
    countUp();
  }

  /* ---------- Count up ---------- */
  function countUp() {
    document.querySelectorAll('[data-count]').forEach(el => {
      const target = +el.dataset.count;
      const suffix = el.dataset.suffix || '';
      const obj = { v: 0 };
      if (window.gsap) {
        gsap.to(obj, { v: target, duration: 2, ease: 'power2.out', onUpdate: () => { el.textContent = Math.floor(obj.v) + suffix; } });
      } else { el.textContent = target + suffix; }
    });
  }

  /* ---------- Card tilt ---------- */
  if (!reduce && window.matchMedia('(hover:hover)').matches) {
    document.querySelectorAll('[data-tilt]').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => card.style.transform = '');
    });
  }

  /* ---------- GSAP parallax ---------- */
  if (window.gsap && window.ScrollTrigger && !reduce) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.to('.hero__glow', { yPercent: 30, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.footer__big', { xPercent: -6, ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  /* ---------- Footer wordmark spotlight reveal ---------- */
  const fb = document.getElementById('footerBig');
  const fill = fb && fb.querySelector('.footer__big-fill');
  if (fb && fill) {
    fb.addEventListener('mousemove', e => {
      const r = fb.getBoundingClientRect();
      fill.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      fill.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
    // tint the custom cursor with the theme color over the wordmark
    if (cursor) {
      fb.addEventListener('mouseenter', () => { cursor.style.borderColor = '#9beb4a'; if (dot) dot.style.background = '#9beb4a'; });
      fb.addEventListener('mouseleave', () => { cursor.style.borderColor = ''; if (dot) dot.style.background = ''; });
    }
  }

  /* ---------- Hero canvas — animated candlestick / particle field ---------- */
  const canvas = document.getElementById('heroCanvas');
  if (canvas && !reduce) {
    const ctx = canvas.getContext('2d');
    let w, h, dpr;
    const dots = [];
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.width = innerWidth * dpr;
      h = canvas.height = innerHeight * dpr;
      canvas.style.width = innerWidth + 'px';
      canvas.style.height = innerHeight + 'px';
    }
    resize();
    window.addEventListener('resize', resize);
    const N = Math.min(90, Math.floor(innerWidth / 16));
    for (let i = 0; i < N; i++) {
      dots.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.25 * dpr, vy: (Math.random() - 0.5) * 0.25 * dpr, r: (Math.random() * 1.6 + 0.4) * dpr });
    }
    // rising trend line points
    let t = 0;
    function draw() {
      ctx.clearRect(0, 0, w, h);
      // connect nearby dots
      for (let i = 0; i < dots.length; i++) {
        const a = dots[i];
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > w) a.vx *= -1;
        if (a.y < 0 || a.y > h) a.vy *= -1;
        for (let j = i + 1; j < dots.length; j++) {
          const b = dots[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 140 * dpr) {
            ctx.strokeStyle = `rgba(155,235,74,${(1 - d / (140 * dpr)) * 0.16})`;
            ctx.lineWidth = 0.6 * dpr;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        ctx.fillStyle = 'rgba(63,174,111,.55)';
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
      }
      // animated trend line
      t += 0.006;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(155,235,74,.22)';
      ctx.lineWidth = 1.4 * dpr;
      for (let x = 0; x <= w; x += 8 * dpr) {
        const y = h * 0.72 - Math.sin(x * 0.004 + t) * 40 * dpr - (x / w) * 120 * dpr + Math.sin(x * 0.01 + t * 2) * 12 * dpr;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      requestAnimationFrame(draw);
    }
    draw();
  }
})();
