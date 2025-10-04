
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
});

// Simple carousel script
const slides = document.querySelectorAll(".project-slide");
const prevBtn = document.querySelector(".carousel-control.prev");
const nextBtn = document.querySelector(".carousel-control.next");
let currentIndex = 0;

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === index);
  });
}

prevBtn.addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + slides.length) % slides.length;
  showSlide(currentIndex);
});

nextBtn.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % slides.length;
  showSlide(currentIndex);
});