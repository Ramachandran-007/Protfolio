const navigation = document.querySelector('#navigation');
const menu = document.querySelector('.menu-toggle');
function closeMenu() { navigation.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); }
menu.addEventListener('click', () => { menu.setAttribute('aria-expanded', String(navigation.classList.toggle('open'))); });
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && navigation.classList.contains('open')) { closeMenu(); menu.focus(); } });
window.matchMedia('(min-width: 701px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
document.querySelector('#year').textContent = new Date().getFullYear();

const stage = document.querySelector('.hero-stage');
const canvas = document.querySelector('#intelligence');
const context = canvas.getContext('2d');
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const pause = document.querySelector('.motion-button');
const modes = {
  ai: { title: 'Neural connections', subtitle: 'Curiosity → possibility', description: 'AI lens: a connected network of ideas, data, and possibilities.', color: '#8473ad' },
  erp: { title: 'Connected workflows', subtitle: 'People → process → progress', description: 'ERPNext lens: structured connections between people, processes, and data.', color: '#718446' },
  security: { title: 'Layers of trust', subtitle: 'Observe → protect → adapt', description: 'Security lens: a protective mesh around the systems that matter.', color: '#4c8489' }
};
let mode = 'ai', width = 0, height = 0, angle = .25, tilt = .25, frame = 0;
let paused = motion.matches, visible = true, dragging = false, lastX = 0, lastY = 0;
const points = Array.from({ length: 62 }, (_, i) => {
  const y = 1 - (i / 61) * 2;
  const radius = Math.sqrt(1 - y * y);
  const theta = Math.PI * (3 - Math.sqrt(5)) * i;
  return { x: Math.cos(theta) * radius, y, z: Math.sin(theta) * radius };
});
function canAnimate() { return !paused && !motion.matches && visible && !document.hidden; }
function draw() {
  if (!context || !width) return;
  context.clearRect(0, 0, width, height);
  const radius = Math.min(width * .34, height * .78);
  const projected = points.map((p, i) => {
    let x = p.x, y = p.y, z = p.z;
    if (mode === 'erp') { x = Math.round(x * 2) / 2; y = Math.round(y * 2) / 2; z = Math.round(z * 2) / 2; }
    if (mode === 'security') { const ring = i % 3; const t = (i / 62) * Math.PI * 6; x = Math.cos(t); y = Math.sin(t) * (ring === 0 ? .35 : .85); z = Math.sin(t) * (ring === 0 ? .85 : .35); }
    const rx = x * Math.cos(angle) - z * Math.sin(angle);
    const rz = x * Math.sin(angle) + z * Math.cos(angle);
    const ry = y * Math.cos(tilt) - rz * Math.sin(tilt);
    return { x: width / 2 + rx * radius, y: height / 2 + ry * radius * .7, z: rz, id: i };
  });
  context.strokeStyle = modes[mode].color;
  for (let i = 0; i < projected.length; i++) {
    const a = projected[i];
    for (let j = i + 1; j < projected.length; j++) {
      const b = projected[j];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (distance < radius * .46 && distance > 14) {
        context.globalAlpha = (1 - distance / (radius * .46)) * .32;
        context.lineWidth = .7;
        context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(b.x, b.y); context.stroke();
      }
    }
    context.globalAlpha = .3 + (a.z + 1) * .25;
    context.fillStyle = modes[mode].color;
    context.beginPath(); context.arc(a.x, a.y, a.id % 7 === 0 ? 4 : 2, 0, Math.PI * 2); context.fill();
  }
  context.globalAlpha = 1;
  if (canAnimate()) { if (!dragging) angle += .0018; frame = requestAnimationFrame(draw); }
}
function restart() { cancelAnimationFrame(frame); draw(); }
function resize() {
  width = stage.clientWidth; height = stage.clientHeight;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = width * ratio; canvas.height = height * ratio;
  if (context) context.setTransform(ratio, 0, 0, ratio, 0, 0);
  restart();
}
function syncPause() {
  const stopped = paused || motion.matches;
  stage.classList.toggle('paused', stopped);
  pause.setAttribute('aria-pressed', String(stopped));
  pause.setAttribute('aria-label', stopped ? 'Play hero animation' : 'Pause hero animation');
  pause.textContent = stopped ? '▷' : 'Ⅱ';
}
pause.addEventListener('click', () => { if (motion.matches) return; paused = !paused; syncPause(); restart(); });
motion.addEventListener('change', () => { paused = motion.matches; syncPause(); restart(); });
document.querySelectorAll('[data-mode]').forEach(button => {
  if (button.tagName !== 'BUTTON') return;
  button.addEventListener('click', () => {
    mode = button.dataset.mode; stage.dataset.mode = mode;
    document.querySelectorAll('.mode-controls button').forEach(item => { item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', String(item === button)); });
    document.querySelector('#node-title').textContent = modes[mode].title;
    document.querySelector('#node-subtitle').textContent = modes[mode].subtitle;
    document.querySelector('#mode-description').textContent = modes[mode].description;
    restart();
  });
});
stage.addEventListener('pointerdown', event => {
  if (event.target.closest('button')) return;
  dragging = true; lastX = event.clientX; lastY = event.clientY; stage.setPointerCapture(event.pointerId);
});
stage.addEventListener('pointermove', event => {
  if (!dragging) return;
  angle += (event.clientX - lastX) * .008;
  tilt = Math.max(-.8, Math.min(.8, tilt + (event.clientY - lastY) * .004));
  lastX = event.clientX; lastY = event.clientY;
  if (!canAnimate()) restart();
});
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => stage.addEventListener(type, () => { dragging = false; }));
new ResizeObserver(resize).observe(stage);
new IntersectionObserver(entries => { visible = entries[0].isIntersecting; restart(); }).observe(stage);
document.addEventListener('visibilitychange', restart);
syncPause(); resize();
