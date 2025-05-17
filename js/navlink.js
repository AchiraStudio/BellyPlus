const burger = document.getElementById('burger');
const navLinks = document.getElementById('nav-links');
const burgerClose = document.getElementById('burger-close');

// Toggle the nav menu when the normal burger is clicked (either open or close it)
burger.addEventListener('click', () => {
  navLinks.classList.toggle('nav-active');
  burger.classList.toggle('nav-active');
});

// Close the nav menu when the burger-close inside nav-links is clicked
burgerClose.addEventListener('click', () => {
  navLinks.classList.remove('nav-active');
  burger.classList.remove('nav-active');
});

// scroll
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  const isIndex = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '';

  let triggerPoint;
  if (isIndex) {
    triggerPoint = window.innerHeight * 0.8;
    if (window.scrollY >= triggerPoint) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  } else {
    // For other pages, add .scrolled as soon as user scrolls down any amount (>0)
    if (window.scrollY > 0) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
});