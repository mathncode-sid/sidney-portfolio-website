
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
});

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
  showSlide(currentIndex); // ensure dots are in sync
});

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