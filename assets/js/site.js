// Mobile menu
(function () {
  const btn = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open'); btn.setAttribute('aria-expanded', false);
  }));
})();

// Hero: a stylised gradient pin plate. Mixed droplets enter on the left;
// organic (amber) drifts toward the wide gaps, aqueous (blue) toward the narrow gaps.
(function () {
  const canvas = document.getElementById('channel');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 800, H = 600;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = W * dpr; canvas.height = H * dpr;
  ctx.scale(dpr, dpr);

  const css = getComputedStyle(document.documentElement);
  const C = {
    ink: css.getPropertyValue('--ink').trim(),
    aq: css.getPropertyValue('--aqueous').trim(),
    or: css.getPropertyValue('--organic').trim(),
    line: css.getPropertyValue('--line').trim(),
    panel: css.getPropertyValue('--panel').trim()
  };

  const box = { x0: 70, x1: 730, y0: 70, y1: 530 };
  // pins: radius shrinks toward the top, so gaps widen toward the top
  const pins = [];
  const rows = 9, cols = 11;
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const t = r / (rows - 1);              // 0 = bottom, 1 = top
      const y = box.y1 - 22 - t * (box.y1 - box.y0 - 44);
      const x = box.x0 + 70 + c * 52 + (r % 2 ? 26 : 0);
      if (x > box.x1 - 40) continue;
      pins.push({ x, y, rad: 20 - t * 12 });
    }
  }

  const drops = [];
  function spawn() {
    const organic = Math.random() < 0.5;
    drops.push({
      x: box.x0 - 30, y: 300 + (Math.random() - 0.5) * 30,
      vx: 1.1 + Math.random() * 0.5,
      organic, r: 7 + Math.random() * 6,
      phase: Math.random() * Math.PI * 2
    });
  }

  function drawStatic() {
    ctx.clearRect(0, 0, W, H);
    // channel body
    ctx.fillStyle = '#fbfcfc';
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(box.x0, box.y0, box.x1 - box.x0, box.y1 - box.y0, 18); ctx.fill(); ctx.stroke();
    // inlet and outlets
    ctx.fillStyle = '#fbfcfc';
    ctx.fillRect(box.x0 - 50, 285, 52, 30); ctx.strokeRect(box.x0 - 50, 285, 50, 30);
    ctx.fillRect(box.x1 - 2, 100, 52, 30); ctx.strokeRect(box.x1, 100, 50, 30);
    ctx.fillRect(box.x1 - 2, 470, 52, 30); ctx.strokeRect(box.x1, 470, 50, 30);
    ctx.fillStyle = '#fbfcfc';
    ctx.fillRect(box.x0 - 1, 286, 4, 28); ctx.fillRect(box.x1 - 3, 101, 5, 28); ctx.fillRect(box.x1 - 3, 471, 5, 28);
    // pins
    pins.forEach(p => {
      ctx.beginPath(); ctx.arc(p.x, p.y, p.rad, 0, Math.PI * 2);
      ctx.fillStyle = C.panel; ctx.fill();
      ctx.strokeStyle = C.line; ctx.lineWidth = 1.5; ctx.stroke();
    });
    // labels
    ctx.font = '600 24px "Schibsted Grotesk", sans-serif';
    ctx.fillStyle = C.ink;
    ctx.fillText('Wide gaps: organic out', box.x0 + 4, box.y0 - 22);
    ctx.fillText('Narrow gaps: aqueous out', box.x0 + 4, box.y1 + 44);
  }

  function step(animate) {
    drawStatic();
    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i];
      if (animate) {
        const progress = Math.max(0, (d.x - box.x0) / (box.x1 - box.x0));
        const targetY = d.organic ? 115 : 485;
        d.y += (targetY - d.y) * 0.012 * (0.4 + progress) + Math.sin(d.phase + d.x * 0.05) * 0.5;
        d.x += d.vx;
      }
      if (d.x > box.x1 + 60) { drops.splice(i, 1); continue; }
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = d.organic ? C.or : C.aq; ctx.fill();
    }
  }

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // pre-fill so the first frame already shows separation
  for (let k = 0; k < 900; k++) { if (k % 9 === 0) spawn(); step(true); }
  if (reduce) { step(false); return; }

  let frame = 0, running = false;
  const io = new IntersectionObserver(es => {
    const visible = es[0].isIntersecting;
    if (visible && !running) { running = true; loop(); } else if (!visible) { running = false; }
  });
  io.observe(canvas);
  function loop() {
    if (!running) return;
    if (frame++ % 9 === 0) spawn();
    step(true);
    requestAnimationFrame(loop);
  }
})();
