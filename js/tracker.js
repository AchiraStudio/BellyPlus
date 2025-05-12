// Fungsi untuk mengambil data minggu dari file JSON
function fetchWeekData() {
  fetch('weekData.json')
    .then(response => response.json())
    .then(data => {
      window.weekData = data;  // Simpan data JSON di variabel global
    })
    .catch(error => {
      console.error('Gagal memuat data minggu:', error);
      alert('Terjadi kesalahan dalam memuat data minggu bayi.');
    });
}

// Fungsi untuk mengupdate informasi berdasarkan minggu
function updateWeek() {
  const week = parseInt(document.getElementById("weekRange").value);
  const data = window.weekData[week];

  document.getElementById("currentWeek").textContent = week;

  if (!data) {
    document.getElementById("weekDescription").innerHTML = "<p>Data belum tersedia untuk minggu ini.</p>";
    return;
  }

  // Update highlights
  document.querySelector(".week-highlights").innerHTML = `
    <div class="highlight"><i class="fas fa-brain"></i><span>${data.highlight.cognitive}</span></div>
    <div class="highlight"><i class="fas fa-hand-paper"></i><span>${data.highlight.motor}</span></div>
    <div class="highlight"><i class="fas fa-comment-dots"></i><span>${data.highlight.speech}</span></div>
  `;

  // Update description
  document.getElementById("weekDescription").innerHTML = `
    <h4>Apa yang Diharapkan Minggu Ini</h4>
    <p>${data.description}</p>
    <div class="milestone-checklist">
      <h5>Pencapaian Minggu Ini</h5>
      ${data.milestones.achieved.map(m => `
        <div class="milestone checked">
          <i class="fas fa-check-circle"></i>
          <span>${m}</span>
        </div>
      `).join("")}
      ${data.milestones.pending.map(m => `
        <div class="milestone">
          <i class="far fa-circle"></i>
          <span>${m}</span>
        </div>
      `).join("")}
    </div>
  `;

  // Update activity suggestions
  document.querySelector(".activity-suggestions").innerHTML = `
    <h4>Kegiatan yang Disarankan</h4>
    ${data.activities.map(a => `
      <div class="activity">
        <i class="fas fa-activity"></i>
        <div>
          <strong>${a.title}</strong>
          <span>${a.benefit}</span>
        </div>
      </div>
    `).join("")}
  `;
}

// Fungsi untuk menangani tombol lacak bayi
function loadBabyData() {
  const id = document.getElementById("babyId").value.trim();
  if (id === "") return alert("Silakan masukkan ID BellyPlus.");

  // Dummy data untuk demo
  document.getElementById("babyName").textContent = "Aqila";
  document.getElementById("babyAge").textContent = "4 bulan";
  document.getElementById("babyStatus").textContent = "Sehat & aktif";
  document.getElementById("babyTips").innerHTML = `
    <li>Pastikan bayi tidur cukup.</li>
    <li>Berikan ASI eksklusif hingga 6 bulan.</li>
    <li>Lakukan stimulasi ringan seperti bermain suara.</li>
  `;
}

// Panggil fungsi fetchWeekData ketika halaman dimuat
window.onload = fetchWeekData;
