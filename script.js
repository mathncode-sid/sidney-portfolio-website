
// Dynamically set the current year
document.getElementById('current-year').textContent = new Date().getFullYear();

const words = ["Django", "Flask"];
let wordIndex = 0;
let charIndex = 0;
const typingSpeed = 200; // Speed of typing each character
const erasingSpeed = 200; // Speed of erasing each character
const delayBetweenWords = 2000; // Delay before switching to the next word
const typingTextElement = document.getElementById("typing-text");

function typeWord() {
    if (charIndex < words[wordIndex].length) {
        typingTextElement.textContent += words[wordIndex].charAt(charIndex);
        charIndex++;
        setTimeout(typeWord, typingSpeed);
    } else {
        setTimeout(eraseWord, delayBetweenWords);
    }
}

function eraseWord() {
    if (charIndex > 0) {
        typingTextElement.textContent = words[wordIndex].substring(0, charIndex - 1);
        charIndex--;
        setTimeout(eraseWord, erasingSpeed);
    } else {
        wordIndex = (wordIndex + 1) % words.length; // Move to the next word
        setTimeout(typeWord, typingSpeed);
    }
}

// Start the typing effect
document.addEventListener("DOMContentLoaded", () => {
    typeWord();
  // Initialize carousel to ensure a single active slide on first load
  showSlide(currentIndex);
  // initialize tech list
  initTechList();
});

/* -----------------------------
   Tech list: load from data/techs.json
   ----------------------------- */

async function loadTechData() {
  try {
    const res = await fetch('./data/techs.json');
    if (!res.ok) throw new Error('Failed to fetch tech data');
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Error loading tech data', err);
    return [];
  }
}

function createTechItem(t) {
  const li = document.createElement('li');
  li.className = 'tech-item reveal';

  const link = document.createElement('button');
  link.className = 'tech-link';
  link.type = 'button';
  link.setAttribute('aria-label', `${t.name} — open details`);

  const figure = document.createElement('figure');
  figure.className = 'tech-figure';
  // Use original raster image uploads (webp/png). This avoids fetching/embedding SVGs.
  const img = document.createElement('img');
  img.src = t.img || '';
  img.alt = `${t.name} logo`;
  img.width = 64; img.height = 64;
  img.loading = 'lazy';
  figure.appendChild(img);

  const label = document.createElement('figcaption');
  label.className = 'tech-label';
  label.textContent = t.name;
  figure.appendChild(label);

  link.appendChild(figure);

  // badge
  const badge = document.createElement('div');
  badge.className = 'tech-badge';
  badge.textContent = t.badge || '';
  link.appendChild(badge);

  // skill meter
  const meter = document.createElement('div');
  meter.className = 'skill-meter';
  meter.setAttribute('role','progressbar');
  meter.setAttribute('aria-valuemin','0');
  meter.setAttribute('aria-valuemax','100');
  meter.setAttribute('aria-valuenow', String(t.level));
  meter.setAttribute('aria-label', `${t.name} proficiency ${t.level} percent`);
  const fill = document.createElement('div');
  fill.className = 'skill-fill';
  fill.dataset.target = String(t.level);
  meter.appendChild(fill);

  link.appendChild(meter);

  // click opens modal with details
  link.addEventListener('click', () => openTechModal(t));

  li.appendChild(link);
  return li;
}

function initTechList(){
  const list = document.getElementById('tech-list');
  if (!list) return;
  list.innerHTML = '';

  // load data then populate
  loadTechData().then(techs => {
    // create items
    techs.forEach((t, i) => {
      const li = createTechItem(t);
      // set a staggered animation delay via inline style
      li.style.transitionDelay = `${i * 60}ms`;
      list.appendChild(li);
    });

    // reveal/animate on scroll (IntersectionObserver) with stagger
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          // small timeout to allow staggered delay to take effect
          setTimeout(() => el.classList.add('visible'), 30);
          // animate skill fill once
          const fill = el.querySelector('.skill-fill');
          if (fill && fill.dataset.target) {
            requestAnimationFrame(() => { fill.style.width = fill.dataset.target + '%'; });
          }
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.18 });

    document.querySelectorAll('.tech-item').forEach(el => observer.observe(el));
  });
}

/* Modal handling */
const modal = document.getElementById('tech-modal');
const modalTitle = document.getElementById('tech-modal-title');
const modalDesc = document.getElementById('tech-modal-desc');
const modalProjects = document.getElementById('tech-modal-projects');

function openTechModal(t){
  if (!modal) return;
  modalTitle.textContent = t.name;
  modalDesc.textContent = t.desc || '';
  modalProjects.innerHTML = '';
  if (t.projects && t.projects.length) {
    t.projects.forEach(p => {
      const a = document.createElement('a');
      a.href = p.href;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = p.title;
      modalProjects.appendChild(a);
    });
  } else {
    const p = document.createElement('div');
    p.textContent = 'No public projects listed for this technology.';
    modalProjects.appendChild(p);
  }

  modal.setAttribute('aria-hidden','false');
  // trap focus: move focus to close button and save previously focused element
  previousFocus = document.activeElement;
  const closeBtn = modal.querySelector('.tech-modal-close');
  if (closeBtn) closeBtn.focus();
  trapFocus(modal);
}

function closeTechModal(){
  if (!modal) return;
  modal.setAttribute('aria-hidden','true');
  releaseFocusTrap();
  // restore focus
  if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
}

// delegate close actions
document.addEventListener('click', (e) => {
  const action = e.target && e.target.dataset && e.target.dataset.action;
  if (action === 'close') closeTechModal();
  if (e.target && e.target.classList && e.target.classList.contains('tech-modal-close')) closeTechModal();
});

// close with Escape
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeTechModal(); });

/* Focus trap utilities for modal */
let previousFocus = null;
let focusTrapHandler = null;
function trapFocus(container) {
  const focusable = container.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])');
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  focusTrapHandler = function(e) {
    if (e.key !== 'Tab') return;
    if (focusable.length === 0) { e.preventDefault(); return; }
    if (e.shiftKey) { // shift + tab
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };
  document.addEventListener('keydown', focusTrapHandler);
}
function releaseFocusTrap() {
  if (focusTrapHandler) document.removeEventListener('keydown', focusTrapHandler);
  focusTrapHandler = null;
}

// Simple carousel script
const slides = document.querySelectorAll(".project-slide");
const prevBtn = document.querySelector(".carousel-control.prev");
const nextBtn = document.querySelector(".carousel-control.next");
const carouselRegion = document.querySelector('.carousel');
const carouselStatus = document.getElementById('carousel-status');
const dotsContainer = document.querySelector('.carousel-dots');
let currentIndex = 0;
let dots = [];

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === index);
  });
  // Update live region for screen readers with the slide title if available
  const active = slides[index];
  if (carouselStatus && active) {
    const title = active.getAttribute('data-title') || (`Slide ${index + 1}`);
    carouselStatus.textContent = `${title} (${index + 1} of ${slides.length})`;
  }
  // Update pagination dots
  if (dots && dots.length) {
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
  }
}

if (prevBtn) {
  prevBtn.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    showSlide(currentIndex);
  });
}

if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % slides.length;
    showSlide(currentIndex);
  });
}

// Create pagination dots dynamically
function createDots() {
  if (!dotsContainer) return;
  dotsContainer.innerHTML = '';
  dots = Array.from({ length: slides.length }, (_, i) => {
    const btn = document.createElement('button');
    btn.className = 'carousel-dot';
    btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
    btn.addEventListener('click', () => {
      currentIndex = i;
      showSlide(currentIndex);
    });
    dotsContainer.appendChild(btn);
    return btn;
  });
}

// Initialize dots on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  createDots();
  // Show dots only on small screens (match CSS breakpoint)
  if (dotsContainer) {
    const shouldShow = window.innerWidth <= 860;
    dotsContainer.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
    // ensure visible style is applied if small screen
    if (shouldShow) dotsContainer.style.display = '';
    else dotsContainer.style.display = 'none';
  }
  showSlide(currentIndex); // ensure dots are in sync
});

// Debounce helper to avoid running resize logic too frequently
function debounce(fn, wait) {
  let t;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

// Update dots visibility on resize (keeps UI in sync when rotating/resizing)
const handleResize = debounce(() => {
  if (!dotsContainer) return;
  const shouldShow = window.innerWidth <= 860;
  dotsContainer.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
  if (shouldShow) dotsContainer.style.display = '';
  else dotsContainer.style.display = 'none';
}, 150);

window.addEventListener('resize', handleResize);

// Keyboard navigation: Left/Right arrows, Home, End
if (carouselRegion) {
  carouselRegion.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        if (slides.length) {
          currentIndex = (currentIndex - 1 + slides.length) % slides.length;
          showSlide(currentIndex);
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (slides.length) {
          currentIndex = (currentIndex + 1) % slides.length;
          showSlide(currentIndex);
        }
        break;
      case 'Home':
        e.preventDefault();
        currentIndex = 0;
        showSlide(currentIndex);
        break;
      case 'End':
        e.preventDefault();
        currentIndex = slides.length - 1;
        showSlide(currentIndex);
        break;
      default:
        break;
    }
  });
}

// Touch / pointer swipe support
let pointerDown = false;
let startX = 0;
let threshold = 40; // px to consider swipe
let isScrolling = undefined;
if (carouselRegion) {
  carouselRegion.addEventListener('pointerdown', (e) => {
    pointerDown = true;
    startX = e.clientX;
  });
  carouselRegion.addEventListener('pointerup', (e) => {
    if (!pointerDown) return;
    pointerDown = false;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > threshold) {
      if (dx > 0) {
        // swipe right -> previous
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      } else {
        // swipe left -> next
        currentIndex = (currentIndex + 1) % slides.length;
      }
      showSlide(currentIndex);
    }
  });
  // Cancel on leaving pointer capture
  carouselRegion.addEventListener('pointercancel', () => { pointerDown = false; });

  // Touch events fallback for devices that prefer touch events
  let touchStartX = 0;
  let touchStartY = 0;
  carouselRegion.addEventListener('touchstart', (e) => {
    if (!e.touches || e.touches.length > 1) return; // ignore multi-touch
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isScrolling = undefined;
  }, { passive: true });

  carouselRegion.addEventListener('touchmove', (e) => {
    if (!e.touches || e.touches.length > 1) return;
    const dx = e.touches[0].clientX - touchStartX;
    const dy = e.touches[0].clientY - touchStartY;
    if (typeof isScrolling === 'undefined') {
      isScrolling = Math.abs(dx) < Math.abs(dy);
    }
    // if it's primarily horizontal swipe, prevent the page from scrolling while user is swiping
    if (!isScrolling) {
      // only prevent default if horizontal threshold exceeded slightly to allow small scrolls
      if (Math.abs(dx) > 10) e.preventDefault();
    }
  }, { passive: false });

  carouselRegion.addEventListener('touchend', (e) => {
    // use changedTouches to get last position
    const touch = e.changedTouches && e.changedTouches[0];
    if (!touch) return;
    const dx = touch.clientX - touchStartX;
    if (Math.abs(dx) > threshold) {
      if (dx > 0) {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      } else {
        currentIndex = (currentIndex + 1) % slides.length;
      }
      showSlide(currentIndex);
    }
  }, { passive: true });
}