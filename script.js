const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const themeLabel = document.getElementById('themeLabel');
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');

// Theme switcher: remembers the visitor's choice.
const savedTheme = localStorage.getItem('ayaan-theme');
if (savedTheme) root.setAttribute('data-theme', savedTheme);
function updateThemeButton() {
  const dark = root.getAttribute('data-theme') === 'dark';
  themeIcon.textContent = dark ? '☼' : '☾';
  themeLabel.textContent = dark ? 'Light mode' : 'Dark mode';
}
updateThemeButton();
themeToggle.addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('ayaan-theme', next);
  updateThemeButton();
});

// Mobile navigation.
menuToggle.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuToggle.classList.toggle('open', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuToggle.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});

// Smooth reveal animations as sections enter the screen.
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Scroll progress and active navigation.
const progressBar = document.getElementById('progressBar');
const navLinks = [...document.querySelectorAll('.nav-link')];
const sections = [...document.querySelectorAll('main section[id]')];
function onScroll() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = `${scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0}%`;
  let current = 'home';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 180) current = section.id;
  });
  navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${current}`));
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Three-card project slider: shows all 3 on wide screens, then slides one card at a time.
const slider = document.getElementById('projectSlider');
const cards = [...slider.querySelectorAll('.project-card')];
const prev = document.getElementById('prevSlide');
const next = document.getElementById('nextSlide');
const sliderProgress = document.getElementById('sliderProgress');
const sliderCount = document.getElementById('sliderCount');
let slideIndex = 0;
let autoSlide;
function visibleCards() {
  if (window.innerWidth <= 700) return 1;
  if (window.innerWidth <= 950) return 2;
  return 3;
}
function maxIndex() { return Math.max(0, cards.length - visibleCards()); }
function renderSlider() {
  slideIndex = Math.min(slideIndex, maxIndex());
  const card = cards[0];
  const gap = parseFloat(getComputedStyle(slider).columnGap) || 0;
  const distance = card.getBoundingClientRect().width + gap;
  slider.style.transform = `translateX(${-slideIndex * distance}px)`;
  const totalSteps = maxIndex() + 1;
  sliderProgress.style.width = `${((slideIndex + 1) / totalSteps) * 100}%`;
  sliderCount.textContent = `${String(slideIndex + 1).padStart(2, '0')} — ${String(cards.length).padStart(2, '0')}`;
  prev.disabled = slideIndex === 0;
  next.disabled = slideIndex === maxIndex();
  prev.style.opacity = prev.disabled ? '.45' : '1';
  next.style.opacity = next.disabled ? '.45' : '1';
}
function goNext() { slideIndex = slideIndex >= maxIndex() ? 0 : slideIndex + 1; renderSlider(); }
function goPrev() { slideIndex = slideIndex <= 0 ? maxIndex() : slideIndex - 1; renderSlider(); }
next.addEventListener('click', () => { goNext(); restartAutoSlide(); });
prev.addEventListener('click', () => { goPrev(); restartAutoSlide(); });
window.addEventListener('resize', renderSlider);
function startAutoSlide() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  autoSlide = setInterval(goNext, 4800);
}
function restartAutoSlide() { clearInterval(autoSlide); startAutoSlide(); }
const sliderViewport = document.getElementById('sliderViewport');
sliderViewport.addEventListener('mouseenter', () => clearInterval(autoSlide));
sliderViewport.addEventListener('mouseleave', startAutoSlide);
let touchStartX = 0;
sliderViewport.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
sliderViewport.addEventListener('touchend', e => {
  const delta = e.changedTouches[0].screenX - touchStartX;
  if (Math.abs(delta) > 45) { delta < 0 ? goNext() : goPrev(); restartAutoSlide(); }
}, { passive: true });
renderSlider();
startAutoSlide();

// Subtle cursor glow on devices with a real pointer.
const cursorGlow = document.getElementById('cursorGlow');
if (window.matchMedia('(pointer:fine)').matches) {
  window.addEventListener('pointermove', e => {
    cursorGlow.style.left = `${e.clientX}px`;
    cursorGlow.style.top = `${e.clientY}px`;
    cursorGlow.style.opacity = '1';
  }, { passive: true });
}

// Gentle magnetic hover on the main hero button.
document.querySelectorAll('.magnetic').forEach(button => {
  button.addEventListener('mousemove', e => {
    const rect = button.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.08;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.12;
    button.style.transform = `translate(${x}px, ${y}px)`;
  });
  button.addEventListener('mouseleave', () => button.style.transform = '');
});

// Footer year.
document.getElementById('year').textContent = new Date().getFullYear();
