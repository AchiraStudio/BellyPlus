const searchInput = document.querySelector('.search-input');
const searchResults = document.querySelector('.search-results');

const features = [
  { name: 'Edukasi / Artikel', url: 'edu.html' },
  { name: 'Pill Reminder / Smart Pill', url: 's-pill.html' },
  { name: 'Konsultasi / Diskusi', url: 'forum.html' },
  { name: 'Tracker / Pelacak Bayi', url: 'tracker.html' },
  { name: 'Home / Menu Utama', url: '../index.html' }
];

// Show all results when focused
searchInput.addEventListener('focus', () => {
  renderResults(features, searchResults);
  searchResults.classList.add('active');
});

// Filter results as user types
searchInput.addEventListener('input', () => {
  const keyword = searchInput.value.toLowerCase();
  const filtered = features.filter(f => f.name.toLowerCase().includes(keyword));
  renderResults(filtered, searchResults);
});

// Hide results when clicking outside
document.addEventListener('click', (e) => {
  if (!document.querySelector('.search').contains(e.target)) {
    searchResults.classList.remove('active');
  }
});

// Render the search results
function renderResults(list, container) {
  container.innerHTML = '';

  if (list.length === 0) {
    container.classList.remove('active');
    return;
  }

  list.forEach(feature => {
    const div = document.createElement('div');
    div.className = 'search-result-item';
    div.textContent = feature.name;

    div.addEventListener('click', () => {
      window.location.href = feature.url;
    });

    container.appendChild(div);
  });

  container.classList.add('active');
}
