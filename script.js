const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() {
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}
menuButton.addEventListener('click', () => {
  const open = navigation.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('open')) {
    closeMenu();
    menuButton.focus();
  }
});
window.matchMedia('(min-width: 701px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});
document.querySelector('#year').textContent = new Date().getFullYear();
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.documentElement.classList.add('js-motion');
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
}

// A lightweight constellation, paused offscreen and for reduced-motion preferences.
const canvas = document.querySelector('.particle-field');
if (canvas) {
  const ctx = canvas.getContext('2d');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0, height = 0, frame = 0, visible = true;
  const dots = Array.from({ length: 34 }, () => ({ x: Math.random(), y: Math.random(), speed: .00008 + Math.random() * .00012 }));
  function resize() {
    width = canvas.clientWidth; height = canvas.clientHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * ratio; canvas.height = height * ratio;
    if (ctx) ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    dots.forEach((dot, i) => {
      if (!motion.matches) dot.y = (dot.y - dot.speed + 1) % 1;
      const x = dot.x * width, y = dot.y * height;
      ctx.fillStyle = i % 3 ? '#36c7ee' : '#ff2d95';
      ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill();
      dots.slice(i + 1).forEach(other => {
        const distance = Math.hypot(x - other.x * width, y - other.y * height);
        if (distance < 95) {
          ctx.strokeStyle = `rgba(54,199,238,${(1 - distance / 95) * .2})`;
          ctx.beginPath();ctx.moveTo(x, y);ctx.lineTo(other.x * width, other.y * height);ctx.stroke();
        }
      });
    });
    if (visible && !motion.matches && !document.hidden) frame = requestAnimationFrame(draw);
  }
  function restart() { cancelAnimationFrame(frame); draw(); }
  new ResizeObserver(() => { resize(); restart(); }).observe(canvas);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; restart(); }).observe(canvas);
  motion.addEventListener('change', restart);
  document.addEventListener('visibilitychange', restart);
}
