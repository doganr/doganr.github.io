/* ===============================
   theme.js — Dogan Bootstrap Theme
   =============================== */

// ── Theme Toggle (Dark / Light) ──────────────────────────
const THEME_KEY = 'dogan-theme';
const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  if (theme === 'light') {
    html.setAttribute('data-bs-theme', 'light');
    if (themeIcon) {
      themeIcon.className = 'fa-solid fa-moon';
    }
  } else {
    html.setAttribute('data-bs-theme', 'dark');
    if (themeIcon) {
      themeIcon.className = 'fa-solid fa-sun';
    }
  }
  localStorage.setItem(THEME_KEY, theme);
}

// Load saved theme
const savedTheme = localStorage.getItem(THEME_KEY) ||
  (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
applyTheme(savedTheme);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme') || 'dark';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });
}

// ── Navbar scroll effect ─────────────────────────────────
const navbar = document.getElementById('mainNavbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });
}

// ── Scroll animations (AOS-like, no dep) ─────────────────
function initScrollAnimations() {
  const elements = document.querySelectorAll('[data-aos]');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.getAttribute('data-aos-delay') || '0');
        setTimeout(() => {
          entry.target.classList.add('aos-animate');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

// ── Table of Contents Generator ──────────────────────────
function generateTOC() {
  const tocContainer = document.getElementById('toc-content');
  if (!tocContainer) return;

  const articleContent = document.querySelector('.article-content');
  if (!articleContent) return;

  const headings = articleContent.querySelectorAll('h2, h3, h4');
  if (!headings.length) {
    tocContainer.closest('.glass-card').style.display = 'none';
    return;
  }

  const fragment = document.createDocumentFragment();
  headings.forEach((heading, i) => {
    // Ensure heading has an ID
    if (!heading.id) {
      heading.id = `heading-${i}`;
    }

    const level = parseInt(heading.tagName.charAt(1));
    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent;
    link.style.paddingLeft = `${(level - 2) * 14 + 12}px`;
    link.style.fontSize = level > 2 ? '0.75rem' : '0.8rem';

    link.addEventListener('click', (e) => {
      e.preventDefault();
      heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    fragment.appendChild(link);
  });
  tocContainer.appendChild(fragment);

  // Highlight active heading on scroll
  const headingArray = Array.from(headings);
  const links = tocContainer.querySelectorAll('a');

  window.addEventListener('scroll', () => {
    let current = '';
    headingArray.forEach(h => {
      if (window.scrollY >= h.offsetTop - 120) {
        current = h.id;
      }
    });
    links.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === `#${current}`);
    });
  }, { passive: true });
}

// ── Code Syntax Highlight ────────────────────────────────
function initCodeHighlight() {
  if (typeof hljs !== 'undefined') {
    document.querySelectorAll('pre code').forEach(block => {
      hljs.highlightElement(block);
    });

    // Add copy button to code blocks
    document.querySelectorAll('pre').forEach(pre => {
      const wrapper = document.createElement('div');
      wrapper.style.position = 'relative';
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      const copyBtn = document.createElement('button');
      copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i>';
      copyBtn.title = 'Copy code';
      copyBtn.style.cssText = `
        position: absolute;
        top: 0.6rem;
        right: 0.6rem;
        background: rgba(108, 99, 255, 0.2);
        border: 1px solid rgba(108, 99, 255, 0.3);
        border-radius: 6px;
        padding: 4px 8px;
        cursor: pointer;
        font-size: 0.75rem;
        color: #a0a0b8;
        transition: all 0.2s;
        z-index: 10;
      `;
      copyBtn.addEventListener('mouseenter', () => {
        copyBtn.style.background = 'rgba(108, 99, 255, 0.5)';
        copyBtn.style.color = '#fff';
      });
      copyBtn.addEventListener('mouseleave', () => {
        copyBtn.style.background = 'rgba(108, 99, 255, 0.2)';
        copyBtn.style.color = '#a0a0b8';
      });
      copyBtn.addEventListener('click', () => {
        const code = pre.querySelector('code');
        navigator.clipboard.writeText(code ? code.textContent : pre.textContent)
          .then(() => {
            copyBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
            copyBtn.style.background = 'rgba(0, 212, 50, 0.3)';
            setTimeout(() => {
              copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i>';
              copyBtn.style.background = 'rgba(108, 99, 255, 0.2)';
            }, 2000);
          });
      });
      wrapper.appendChild(copyBtn);
    });
  }
}

// ── Particle Canvas ──────────────────────────────────────
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const canvas = document.createElement('canvas');
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let W, H, particles;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.r = Math.random() * 1.5 + 0.5;
      this.alpha = Math.random() * 0.3 + 0.05;
      const colors = ['108, 99, 255', '0, 212, 255', '255, 101, 132'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
      ctx.fill();
    }
  }

  resize();
  particles = Array.from({ length: 80 }, () => new Particle());

  window.addEventListener('resize', resize, { passive: true });

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    // Draw connecting lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(108, 99, 255, ${0.06 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }
  animate();
}

// ── Smooth reading progress bar ───────────────────────────
function initReadingProgress() {
  const article = document.querySelector('.article-content');
  if (!article) return;

  const bar = document.createElement('div');
  bar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    width: 0%;
    background: linear-gradient(90deg, #6c63ff, #00d4ff);
    z-index: 9999;
    transition: width 0.1s;
    pointer-events: none;
  `;
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (window.scrollY / docH) * 100;
    bar.style.width = Math.min(scrolled, 100) + '%';
  }, { passive: true });
}

// ── Active nav link ───────────────────────────────────────
function setActiveNavLink() {
  const current = window.location.pathname;
  document.querySelectorAll('.nav-pill').forEach(link => {
    const href = link.getAttribute('href');
    if (href && current.endsWith(href)) {
      link.classList.add('active');
    }
  });
}

// ── Init all ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  generateTOC();
  initCodeHighlight();
  initParticles();
  initReadingProgress();
  setActiveNavLink();

  // Trigger scroll to check already-visible elements
  window.dispatchEvent(new Event('scroll'));
});
