// API Config (Use your keys)
const YT_API_KEY = 'AIzaSyAQU5YYyU8pXaO6svthwVweCSY5qV7RxAo'; 
const NEWS_API_KEY = '60cc7ac812a646faa6e6a6c473058012';
const TRANSLATE_API_KEY = 'YOUR_GOOGLE_TRANSLATE_KEY'; // Optional


// Fetch Indonesian content
async function fetchIndonesianContent() {
  try {
    // 1. YouTube (Indonesian videos)
    const youtubeRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${YT_API_KEY}&q=kehamilan+OR+parenting+anak&part=snippet&type=video&maxResults=15&relevanceLanguage=id`
    );
    const youtubeData = await youtubeRes.json();
    renderVideos(youtubeData.items, "pregnancy-container");

    // 2. Wikipedia (Indonesian articles)
    const wikiRes = await fetch(
      `https://id.wikipedia.org/w/api.php?action=query&list=search&srsearch=kehamilan+OR+pengasuhan+anak&format=json&origin=*&utf8=&srlimit=15`
    );
    const wikiData = await wikiRes.json();
    renderArticles(wikiData.query.search, "parenting-container");

    // 3. NewsAPI (Indonesian news)
    const newsRes = await fetch(
      `https://newsapi.org/v2/everything?q=anak+OR+kehamilan&language=id&apiKey=${NEWS_API_KEY}&pageSize=15`
    );
    const newsData = await newsRes.json();
    renderNews(newsData.articles, "health-container");

  } catch (err) {
    console.error("Error:", err);
    loadFallbackData();
  }
}

// --- Render Functions (Localized) ---

// 1. YouTube Videos (Indonesian)
function renderVideos(videos, containerId) {
  const container = document.querySelector(`#${containerId} .dynamic-content`);
  videos.slice(0, 10).forEach(video => {
    container.innerHTML += `
      <div class="video-card">
        <img src="${video.snippet.thumbnails.medium.url}" alt="${video.snippet.title}" class="video-thumbnail">
        <h3>${video.snippet.title}</h3>
        <p>${video.snippet.channelTitle}</p>
        <a href="https://youtube.com/watch?v=${video.id.videoId}" target="_blank" class="play-button">▶ Tonton</a>
      </div>
    `;
  });
}

// 2. Wikipedia Articles (Indonesian)
function renderArticles(articles, containerId) {
  const container = document.querySelector(`#${containerId} .dynamic-content`);
  articles.slice(0, 10).forEach(article => {
    const excerpt = article.snippet.substring(0, 100) + '...';
    container.innerHTML += `
      <div class="wiki-card">
        <h3>${article.title}</h3>
        <p>${excerpt}</p>
        <a href="https://id.wikipedia.org/?curid=${article.pageid}" target="_blank" class="wiki-link">Baca Selengkapnya →</a>
      </div>
    `;
  });
}

// 3. News Articles (Indonesian)
function renderNews(articles, containerId) {
  const container = document.querySelector(`#${containerId} .dynamic-content`);
  articles.slice(0, 10).forEach(article => {
    const imageUrl = article.urlToImage || 'https://via.placeholder.com/400x200?text=Tidak+Ada+Gambar';
    container.innerHTML += `
      <div class="news-card">
        <img src="${imageUrl}" alt="${article.title}" class="news-image">
        <div class="news-content">
          <h3>${article.title}</h3>
          <p>${article.description || 'Tidak ada deskripsi.'}</p>
          <a href="${article.url}" target="_blank" class="news-link">Baca Artikel →</a>
        </div>
      </div>
    `;
  });
}

// Optional: Auto-translate English titles to Indonesian
async function translateToIndonesian(text) {
  const res = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${TRANSLATE_API_KEY}&q=${encodeURIComponent(text)}&source=en&target=id`
  );
  const data = await res.json();
  return data.data.translations[0].translatedText;
}

// Initialize
fetchIndonesianContent();