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
searchInputs.forEach((input, index) => {
  const resultsBox = searchResultsList[index];

  input.addEventListener('focus', () => {
    renderResults(features, resultsBox);
    resultsBox.classList.add('active');
  });

  input.addEventListener('input', () => {
    const keyword = input.value.toLowerCase();
    const filtered = features.filter(f => f.name.toLowerCase().includes(keyword));
    renderResults(filtered, resultsBox);
  });
});

// Hide results when clicking outside any search box
document.addEventListener('click', (e) => {
  const isInSearch = [...document.querySelectorAll('.search, .search-mobile')]
    .some(searchBox => searchBox.contains(e.target));

  if (!isInSearch) {
    searchResultsList.forEach(r => r.classList.remove('active'));
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
