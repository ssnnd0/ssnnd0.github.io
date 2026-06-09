(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const spacing = 30;
  const baseRadius = 0.3;
  let waves = [];
  let time = 0;
  let cols = 0, rows = 0;
  let offsetX = 0, offsetY = 0;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    cols = Math.ceil(canvas.width / spacing) + 2;
    rows = Math.ceil(canvas.height / spacing) + 2;
    offsetX = (canvas.width - (cols - 2) * spacing) / 2;
    offsetY = (canvas.height - (rows - 2) * spacing) / 2;
  }

  function update() {
    time += 0.016;
    for (let i = waves.length - 1; i >= 0; i--) {
      const w = waves[i];
      w.radius += w.speed;
      w.age += 0.016;
      w.amp = Math.max(0, 1 - w.radius / w.maxR) * Math.exp(-w.age * 0.5);
      if (w.amp < 0.005 || w.radius > w.maxR) waves.splice(i, 1);
    }
  }

  function render() {
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const bx = offsetX + c * spacing;
        const by = offsetY + r * spacing;
        if (bx < -30 || bx > W + 30 || by < -30 || by > H + 30) continue;

        let bright = 0;

        for (const w of waves) {
          const dist = Math.hypot(bx - w.x, by - w.y);
          const diff = dist - w.radius;
          if (Math.abs(diff) < 45) {
            const infl = w.amp * Math.exp(-(diff * diff) / 250);
            if (infl > 0.005) bright += infl;
          }
        }

        const flicker = 0.02 * Math.sin(time * 3.7 + bx * 0.5 + by * 0.3) + 0.02 * Math.sin(time * 5.1 + by * 0.7);
        const idle = 0.08 + 0.025 * Math.sin(time * (0.6 + ((bx + by) % 7) * 0.12)) + flicker;
        const fb = Math.max(idle, Math.min(bright * 1.3, 0.95));
        const rad = baseRadius + bright * 1.5;
        const v = Math.floor(50 + fb * 130);

        ctx.beginPath();
        ctx.arc(bx, by, rad, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${v}, ${v}, ${v}, ${fb * 0.6})`;
        ctx.fill();
      }
    }
  }

  function loop() {
    update();
    render();
    requestAnimationFrame(loop);
  }

  resize();
  loop();

  function spawnWave(x, y) {
    for (let i = 0; i < 2; i++) {
      waves.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        radius: 0, age: 0,
        maxR: 80 + Math.random() * 60,
        speed: 3.5 + Math.random() * 2,
        amp: 1,
      });
    }
  }

  let lastWave = 0;
  document.addEventListener('mousemove', function (e) {
    const now = performance.now();
    if (now - lastWave < 50) return;
    lastWave = now;
    spawnWave(e.clientX, e.clientY);
  });

  document.addEventListener('touchmove', function (e) {
    const now = performance.now();
    if (now - lastWave < 80) return;
    lastWave = now;
    const t = e.touches[0];
    if (t) spawnWave(t.clientX, t.clientY);
  }, { passive: true });

  document.addEventListener('touchstart', function (e) {
    const t = e.touches[0];
    if (t) { spawnWave(t.clientX, t.clientY); spawnWave(t.clientX, t.clientY); }
  }, { passive: true });

  window.addEventListener('resize', resize);
})();
