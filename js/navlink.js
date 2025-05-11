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