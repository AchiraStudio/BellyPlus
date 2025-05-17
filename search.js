const searchInput = document.querySelector('.search-input');
const searchResults = document.querySelector('.search-results');

const features = [
  { name: 'Edukasi / Artikel', url: 'pages/edu.html' },
  { name: 'Pill Reminder / Smart Pill', url: 'pages/s-pill.html' },
  { name: 'Konsultasi / Diskusi', url: 'pages/forum.html' },
  { name: 'Tracker / Pelacak Bayi', url: '/pages/tracker.html' },
  { name: 'Home / Menu Utama', url: 'index.html' }
];

// Show all features when focused
searchInput.addEventListener('focus', () => {
  renderResults(features);
  searchResults.classList.add('active');
});

// Filter as user types
searchInput.addEventListener('input', () => {
  const keyword = searchInput.value.toLowerCase();
  const filtered = features.filter(f => f.name.toLowerCase().includes(keyword));
  renderResults(filtered);
});

// Hide results when clicking outside
document.addEventListener('click', (e) => {
  if (!document.querySelector('.search').contains(e.target)) {
    searchResults.classList.remove('active');
  }
});

// Render the search results
function renderResults(list) {
  searchResults.innerHTML = '';

  if (list.length === 0) {
    searchResults.classList.remove('active');
    return;
  }

  list.forEach(feature => {
    const div = document.createElement('div');
    div.className = 'search-result-item';
    div.textContent = feature.name;

    div.addEventListener('click', () => {
      window.location.href = feature.url;
    });

    searchResults.appendChild(div);
  });

  searchResults.classList.add('active');
}
