// DOM Elements
const medicineModal = document.getElementById('medicineModal');
const closeMedicineModal = document.getElementById('closeMedicineModal');
const medicineForm = document.getElementById('medicineForm');
const addMedicineBtn = document.getElementById('addMedicineBtn');
const addFirstMedicineBtn = document.getElementById('addFirstMedicineBtn');
const changeMedicineBtn = document.getElementById('changeMedicineBtn');
const editMedicineBtn = document.getElementById('editMedicineBtn');
const deleteMedicineBtn = document.getElementById('deleteMedicineBtn');
const medicineEmptyState = document.getElementById('medicineEmptyState');
const medicineContent = document.getElementById('medicineContent');
const selectMedicineModal = document.getElementById('selectMedicineModal');
const closeSelectMedicineModal = document.getElementById('closeSelectMedicineModal');
const medicineListContainer = document.getElementById('medicineListContainer');
const addNewMedicineFromListBtn = document.getElementById('addNewMedicineFromListBtn');
const scheduleEmptyState = document.getElementById('scheduleEmptyState');
const scheduleContent = document.getElementById('scheduleContent');
const scheduleList = document.getElementById('scheduleList');
const currentDateElement = document.getElementById('currentDate');
const complianceValue = document.getElementById('complianceValue');
const complianceText = document.getElementById('complianceText');
const statName = document.getElementById('statName');
const statBellyId = document.getElementById('statBellyId');
const statPills = document.getElementById('statPills');
const statCompliance = document.getElementById('statCompliance');
const statDays = document.getElementById('statDays');
const userAvatar = document.getElementById('user-avatar');
const cancelMedicineBtn = document.getElementById('cancelMedicineBtn');
const historyModal = document.getElementById('historyModal');
const closeHistoryModal = document.getElementById('closeHistoryModal');
const historyList = document.getElementById('historyList');
const viewHistoryBtn = document.getElementById('viewHistoryBtn');
const medicalFactElement = document.getElementById('medicalFact');

// State
let medicines = [];
let selectedMedicineId = null;
let completedDoses = [];
let startDate = null;
let dailySchedules = {};
let medicineHistory = [];
let notificationTimeoutIds = [];

const medicineDatabase = {
  'Paracetamol': {
    type: 'Tablet',
    benefit: 'Mengurangi demam dan nyeri ringan hingga sedang',
    instruction: 'Diminum setelah makan. Jangan melebihi dosis harian yang dianjurkan.'
  },
  'Amoxicillin': {
    type: 'Kapsul',
    benefit: 'Antibiotik untuk infeksi bakteri',
    instruction: 'Harus dihabiskan sesuai resep dokter. Minum dengan air putih.'
  },
  'Omeprazole': {
    type: 'Kapsul',
    benefit: 'Mengurangi asam lambung',
    instruction: 'Diminum 30 menit sebelum makan pagi.'
  },
  'Vitamin C': {
    type: 'Tablet kunyah',
    benefit: 'Meningkatkan daya tahan tubuh',
    instruction: 'Diminum setelah makan. Bisa dikunyah atau ditelan.'
  }
};

const medicalFacts = [
  "Minum obat tepat waktu meningkatkan efektivitas pengobatan hingga 30%",
  "Antibiotik harus dihabiskan sesuai resep meskipun gejala sudah membaik",
  "Interaksi obat dengan grapefruit bisa berbahaya untuk beberapa jenis obat",
  "Obat penurun demam bekerja optimal bila diminum dengan air hangat",
  "Jangan mencampur obat dengan minuman berkafein tanpa konsultasi dokter",
  "Simpan obat di tempat sejuk dan kering, hindari paparan sinar matahari langsung",
  "Obat kadaluarsa bisa kehilangan efektivitas atau menjadi berbahaya"
];

// Initialize the application
function initApp() {
  medicineModal.classList.remove('show');
  selectMedicineModal.classList.remove('show');
  historyModal.classList.remove('show');
  
  loadFromLocalStorage();
  updateCurrentDate();
  initButtons();
  showRandomMedicalFact();
  setupNotificationPermission();
  
  // Check for missed doses from previous days
  checkMissedDoses();
}

// Load data from localStorage
function loadFromLocalStorage() {
  const storedMedicines = localStorage.getItem('medicines');
  const storedSelectedMedicine = localStorage.getItem('selectedMedicineId');
  const storedCompletedDoses = localStorage.getItem('completedDoses');
  const storedStartDate = localStorage.getItem('startDate');
  const storedDailySchedules = localStorage.getItem('dailySchedules');
  const storedMedicineHistory = localStorage.getItem('medicineHistory');

  if (storedMedicines) medicines = JSON.parse(storedMedicines);
  if (storedSelectedMedicine) selectedMedicineId = storedSelectedMedicine;
  if (storedCompletedDoses) completedDoses = JSON.parse(storedCompletedDoses);
  if (storedDailySchedules) dailySchedules = JSON.parse(storedDailySchedules);
  if (storedMedicineHistory) medicineHistory = JSON.parse(storedMedicineHistory);

  startDate = storedStartDate ? new Date(storedStartDate) : new Date();
  if (!storedStartDate) localStorage.setItem('startDate', startDate.toISOString());

  if (statPills) statPills.textContent = medicines.length;
  updateDaysCount();

  const selectedMed = medicines.find(m => m.id === selectedMedicineId);
  if (selectedMed) showMedicineContent(selectedMed);
}

// Initialize all button event listeners
function initButtons() {
  // Medicine management buttons
  if (addMedicineBtn) addMedicineBtn.addEventListener('click', openAddMedicineModal);
  if (addFirstMedicineBtn) addFirstMedicineBtn.addEventListener('click', openAddMedicineModal);
  if (changeMedicineBtn) changeMedicineBtn.addEventListener('click', openMedicineSelectionModal);
  if (editMedicineBtn) editMedicineBtn.addEventListener('click', openEditMedicineModal);
  if (deleteMedicineBtn) deleteMedicineBtn.addEventListener('click', deleteCurrentMedicine);
  if (viewHistoryBtn) viewHistoryBtn.addEventListener('click', openHistoryModal);

  // Modal control buttons
  if (closeMedicineModal) closeMedicineModal.addEventListener('click', () => medicineModal.classList.remove('show'));
  if (closeSelectMedicineModal) closeSelectMedicineModal.addEventListener('click', () => selectMedicineModal.classList.remove('show'));
  if (closeHistoryModal) closeHistoryModal.addEventListener('click', () => historyModal.classList.remove('show'));
  if (cancelMedicineBtn) cancelMedicineBtn.addEventListener('click', () => medicineModal.classList.remove('show'));

  // Form submission
  if (medicineForm) medicineForm.addEventListener('submit', handleMedicineFormSubmit);

  // Add new medicine from list button
  if (addNewMedicineFromListBtn) addNewMedicineFromListBtn.addEventListener('click', () => {
    selectMedicineModal.classList.remove('show');
    openAddMedicineModal();
  });
}

// Medicine Modal Functions
function openAddMedicineModal() {
  if (!medicineModal) return;
  
  document.getElementById('medicineModalTitle').textContent = 
    medicines.length === 0 ? "Tambah Obat Pertama" : "Tambah Obat Baru";
  medicineForm.reset();
  document.getElementById('medicineEditId').value = '';
  medicineModal.classList.add('show');
}

function openEditMedicineModal() {
  if (!medicineModal) return;
  
  const medicine = medicines.find(m => m.id === selectedMedicineId);
  if (medicine) {
    document.getElementById('medicineModalTitle').textContent = "Edit Obat";
    document.getElementById('medicineNameInput').value = medicine.name;
    document.getElementById('medicineFrequencyInput').value = medicine.frequency;
    document.getElementById('medicineEditId').value = medicine.id;
    medicineModal.classList.add('show');
  }
}

function openMedicineSelectionModal() {
  if (!selectMedicineModal) return;
  
  renderMedicineList();
  selectMedicineModal.classList.add('show');
}

function openHistoryModal() {
  if (!historyModal) return;
  
  renderHistoryList();
  historyModal.classList.add('show');
}

function handleMedicineFormSubmit(e) {
  e.preventDefault();
  
  const id = document.getElementById('medicineEditId').value || Date.now().toString();
  const name = document.getElementById('medicineNameInput').value;
  const frequency = document.getElementById('medicineFrequencyInput').value;
  
  // Auto-fill medicine details from database
  const medicineDetails = medicineDatabase[name] || {
    type: 'Tablet',
    benefit: 'Obat untuk mengatasi gejala yang dialami',
    instruction: 'Diminum sesuai petunjuk dokter'
  };
  
  const medicine = {
    id,
    name,
    frequency: parseInt(frequency),
    ...medicineDetails
  };
  
  // Update or add medicine
  if (document.getElementById('medicineEditId').value) {
    const index = medicines.findIndex(m => m.id === id);
    if (index !== -1) medicines[index] = medicine;
  } else {
    medicines.push(medicine);
    if (statPills) statPills.textContent = medicines.length;
    
    // Add to history
    medicineHistory.push({
      action: 'added',
      medicine,
      date: new Date().toISOString()
    });
    saveMedicineHistory();
  }
  
  saveMedicines();
  
  // Select and show the medicine
  selectedMedicineId = id;
  localStorage.setItem('selectedMedicineId', id);
  showMedicineContent(medicine);
  
  medicineModal.classList.remove('show');
}

function deleteCurrentMedicine() {
  if (!selectedMedicineId) return;
  
  const confirmDelete = confirm("Apakah Anda yakin ingin menghapus obat ini?");
  if (!confirmDelete) return;
  
  // Add to history before deleting
  const medicine = medicines.find(m => m.id === selectedMedicineId);
  if (medicine) {
    medicineHistory.push({
      action: 'deleted',
      medicine,
      date: new Date().toISOString()
    });
    saveMedicineHistory();
  }
  
  medicines = medicines.filter(m => m.id !== selectedMedicineId);
  selectedMedicineId = null;
  localStorage.removeItem('selectedMedicineId');
  
  if (statPills) statPills.textContent = medicines.length;
  saveMedicines();
  
  // Update UI
  if (medicines.length === 0) {
    if (medicineEmptyState) medicineEmptyState.style.display = 'block';
    if (medicineContent) medicineContent.style.display = 'none';
    if (scheduleEmptyState) scheduleEmptyState.style.display = 'block';
    if (scheduleContent) scheduleContent.style.display = 'none';
  } else {
    openMedicineSelectionModal();
  }
}

// Medicine List Functions
function renderMedicineList() {
  if (!medicineListContainer) return;
  
  if (medicines.length === 0) {
    medicineListContainer.innerHTML = '<p>Belum ada obat yang ditambahkan</p>';
    return;
  }
  
  let html = '<div class="medicine-list" style="display: flex; flex-direction: column; gap: 0.5rem;">';
  medicines.forEach(medicine => {
    html += `
      <div class="medicine-item" style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background-color: var(--bg-primary); border-radius: var(--rounded);">
        <div>
          <div style="font-weight: 600;">${medicine.name}</div>
          <div style="font-size: 0.8rem; color: var(--text-secondary);">${medicine.type}</div>
        </div>
        <button class="btn btn-primary select-medicine-btn" data-id="${medicine.id}" style="padding: 0.25rem 0.5rem;">
          Pilih
        </button>
      </div>
    `;
  });
  html += '</div>';
  
  medicineListContainer.innerHTML = html;
  
  // Add event listeners to select buttons
  document.querySelectorAll('.select-medicine-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const medicineId = btn.getAttribute('data-id');
      const medicine = medicines.find(m => m.id === medicineId);
      if (medicine) {
        selectedMedicineId = medicineId;
        localStorage.setItem('selectedMedicineId', medicineId);
        showMedicineContent(medicine);
        selectMedicineModal.classList.remove('show');
      }
    });
  });
}

function renderHistoryList() {
  if (!historyList) return;
  
  if (medicineHistory.length === 0) {
    historyList.innerHTML = '<p>Belum ada riwayat obat</p>';
    return;
  }
  
  let html = '<div class="history-list" style="display: flex; flex-direction: column; gap: 0.5rem;">';
  medicineHistory.slice().reverse().forEach(entry => {
    const date = new Date(entry.date);
    const dateStr = date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const actionText = entry.action === 'added' ? 'Ditambahkan' : 
                      entry.action === 'deleted' ? 'Dihapus' : 
                      entry.action === 'completed' ? 'Dosis selesai' : 'Diubah';
    
    html += `
      <div class="history-item" style="padding: 0.75rem; background-color: var(--bg-primary); border-radius: var(--rounded);">
        <div style="display: flex; justify-content: space-between;">
          <div style="font-weight: 600;">${entry.medicine.name}</div>
          <div style="font-size: 0.8rem; color: var(--text-secondary);">${dateStr}</div>
        </div>
        <div style="font-size: 0.9rem; margin-top: 0.25rem;">
          <span class="badge ${getHistoryBadgeClass(entry.action)}">${actionText}</span>
          ${entry.action === 'completed' ? `pukul ${entry.time}` : ''}
        </div>
        <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.25rem;">
          Frekuensi: ${entry.medicine.frequency}x sehari
        </div>
      </div>
    `;
  });
  html += '</div>';
  
  historyList.innerHTML = html;
}

function getHistoryBadgeClass(action) {
  switch (action) {
    case 'added': return 'bg-success';
    case 'deleted': return 'bg-danger';
    case 'completed': return 'bg-primary';
    default: return 'bg-secondary';
  }
}

// Show medicine content and schedule
function showMedicineContent(medicine) {
  renderMedicineInfo(medicine);
  renderSchedule(medicine);
  if (medicineEmptyState) medicineEmptyState.style.display = 'none';
  if (medicineContent) medicineContent.style.display = 'block';
  if (scheduleEmptyState) scheduleEmptyState.style.display = 'none';
  if (scheduleContent) scheduleContent.style.display = 'block';
  
  // Schedule notifications for this medicine
  scheduleNotifications(medicine);
}

function renderMedicineInfo(medicine) {
  if (!medicine) return;
  
  if (document.getElementById('medicineName')) 
    document.getElementById('medicineName').textContent = medicine.name;

  if (document.getElementById('medicineId')) 
    document.getElementById('medicineId').textContent = `ID: ${medicine.id.slice(0, 8)}`;

  if (document.getElementById('medicineType')) 
    document.getElementById('medicineType').textContent = medicine.type;

  if (document.getElementById('medicineBenefit')) 
    document.getElementById('medicineBenefit').textContent = medicine.benefit;

  if (document.getElementById('medicineInstruction')) 
    document.getElementById('medicineInstruction').textContent = medicine.instruction;

  let frequencyText = '';
  switch (medicine.frequency) {
    case 1: frequencyText = '1x sehari (Pagi)'; break;
    case 2: frequencyText = '2x sehari (Pagi & Malam)'; break;
    case 3: frequencyText = '3x sehari (Pagi, Siang, Malam)'; break;
    case 4: frequencyText = '4x sehari (Pagi, Siang, Sore, Malam)'; break;
    default: frequencyText = `${medicine.frequency}x sehari`;
  }

  if (document.getElementById('medicineFrequency')) 
    document.getElementById('medicineFrequency').textContent = frequencyText;
}

// Schedule Functions
function updateCurrentDate() {
  if (!currentDateElement) return;
  
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  currentDateElement.textContent = now.toLocaleDateString('id-ID', options);
}

function updateDaysCount() {
  if (!statDays || !startDate) return;
  
  const today = new Date();
  const diffTime = Math.abs(today - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  statDays.textContent = diffDays;
}

function renderSchedule(medicine) {
  if (!medicine || !scheduleList) return;
  
  const today = new Date().toISOString().split('T')[0];
  
  // Initialize today's schedule if not exists
  if (!dailySchedules[today]) {
    dailySchedules[today] = {
      date: today,
      medicineId: medicine.id,
      completed: []
    };
    saveDailySchedules();
  }
  
  scheduleList.innerHTML = '';
  const now = new Date();
  const timeSlots = [];
  
  // Create time slots based on frequency
  switch (medicine.frequency) {
    case 1: timeSlots.push({ time: '08:00', period: 'morning', icon: 'sun' }); break;
    case 2:
      timeSlots.push({ time: '08:00', period: 'morning', icon: 'sun' });
      timeSlots.push({ time: '20:00', period: 'night', icon: 'moon' });
      break;
    case 3:
      timeSlots.push({ time: '08:00', period: 'morning', icon: 'sun' });
      timeSlots.push({ time: '13:00', period: 'afternoon', icon: 'cloud-sun' });
      timeSlots.push({ time: '20:00', period: 'night', icon: 'moon' });
      break;
    case 4:
      timeSlots.push({ time: '08:00', period: 'morning', icon: 'sun' });
      timeSlots.push({ time: '12:00', period: 'afternoon', icon: 'cloud-sun' });
      timeSlots.push({ time: '16:00', period: 'evening', icon: 'cloud-moon' });
      timeSlots.push({ time: '20:00', period: 'night', icon: 'moon' });
      break;
  }
  
  // Calculate current time for status
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;
  
  // Calculate compliance
  let completedCount = dailySchedules[today]?.completed.length || 0;
  
  // Render each time slot
  timeSlots.forEach(slot => {
    const [hour, minute] = slot.time.split(':').map(Number);
    const slotTime = hour * 60 + minute;
    const isCompleted = dailySchedules[today]?.completed.includes(slot.time);
    const isUpcoming = !isCompleted && slotTime > currentTime;
    const isMissed = !isCompleted && slotTime < currentTime - 30; // 30 minutes grace period
    
    const statusClass = isCompleted ? 'status-completed' : 
                      isUpcoming ? 'status-upcoming' : 
                      isMissed ? 'status-missed' : '';
    
    const statusText = isCompleted ? 'Selesai' : 
                      isUpcoming ? 'Akan datang' : 
                      isMissed ? 'Terlewat' : 'Dalam 15 menit';
    
    const li = document.createElement('li');
    li.className = 'schedule-item';
    li.innerHTML = `
      <div class="schedule-time">
        <span class="time-icon ${slot.period}-icon">
          <i class="fas fa-${slot.icon}"></i>
        </span>
        <span>${slot.time}</span>
      </div>
      <div class="schedule-details">
        <p class="schedule-status ${statusClass}">${statusText}</p>
      </div>
      <div class="schedule-action">
        ${isCompleted ? 
          `<i class="fas fa-check-circle" style="color: var(--success-500);"></i>` : 
          `<button class="btn btn-outline complete-dose-btn" data-time="${slot.time}" style="padding: 0.25rem 0.5rem;">
            <i class="fas fa-check"></i> Selesai
          </button>`
        }
      </div>
    `;
    
    scheduleList.appendChild(li);
  });
  
  // Add event listeners to complete buttons
  document.querySelectorAll('.complete-dose-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const time = e.currentTarget.getAttribute('data-time');
      completeDose(medicine.id, time);
    });
  });
  
  // Update compliance display
  updateComplianceDisplay(completedCount, timeSlots.length);
}

function completeDose(medicineId, time) {
  const today = new Date().toISOString().split('T')[0];
  const medicine = medicines.find(m => m.id === medicineId);
  
  if (!dailySchedules[today]) {
    dailySchedules[today] = {
      date: today,
      medicineId,
      completed: []
    };
  }
  
  if (!dailySchedules[today].completed.includes(time)) {
    dailySchedules[today].completed.push(time);
    saveDailySchedules();
    
    // Add to history
    medicineHistory.push({
      action: 'completed',
      medicine,
      time,
      date: new Date().toISOString()
    });
    saveMedicineHistory();
  }
  
  renderSchedule(medicine);
}

function checkMissedDoses() {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  if (dailySchedules[yesterdayStr]) {
    const medicine = medicines.find(m => m.id === dailySchedules[yesterdayStr].medicineId);
    if (medicine) {
      const timeSlots = getTimeSlotsForFrequency(medicine.frequency);
      const missedDoses = timeSlots.filter(time => 
        !dailySchedules[yesterdayStr].completed.includes(time)
      );
      
      if (missedDoses.length > 0) {
        // Notify user about missed doses
        if (Notification.permission === 'granted') {
          new Notification(`Dosis terlewat kemarin`, {
            body: `Anda melewatkan ${missedDoses.length} dosis ${medicine.name} kemarin`
          });
        }
      }
    }
  }
}

function getTimeSlotsForFrequency(frequency) {
  switch (frequency) {
    case 1: return ['08:00'];
    case 2: return ['08:00', '20:00'];
    case 3: return ['08:00', '13:00', '20:00'];
    case 4: return ['08:00', '12:00', '16:00', '20:00'];
    default: return [];
  }
}

function updateComplianceDisplay(completedCount, totalDoses) {
  const compliancePercentage = totalDoses > 0 ? Math.round((completedCount / totalDoses) * 100) : 0;
  if (complianceValue) complianceValue.textContent = `${compliancePercentage}%`;
  if (complianceText) complianceText.textContent = `${completedCount} dari ${totalDoses} dosis`;
  if (statCompliance) statCompliance.textContent = `${compliancePercentage}%`;
  
  // Update gauge
  const gaugeProgress = document.querySelector('.gauge-progress');
  if (gaugeProgress) {
    const offset = 251 - (251 * (compliancePercentage / 100));
    gaugeProgress.style.strokeDashoffset = offset;
  }
}

// Notification Functions
function setupNotificationPermission() {
  if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      console.log('Notification permission:', permission);
    });
  }
}

function scheduleNotifications(medicine) {
  // Clear any existing notifications
  clearAllScheduledNotifications();
  
  if (Notification.permission !== 'granted') return;
  
  const timeSlots = getTimeSlotsForFrequency(medicine.frequency);
  const now = new Date();
  
  timeSlots.forEach(time => {
    const [hours, minutes] = time.split(':').map(Number);
    const notificationTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes,
      0
    );
    
    // If the time has already passed today, skip
    if (notificationTime < now) return;
    
    const timeout = notificationTime.getTime() - now.getTime();
    const timeoutId = setTimeout(() => {
      showDoseNotification(medicine, time);
    }, timeout);
    
    notificationTimeoutIds.push(timeoutId);
  });
}

function showDoseNotification(medicine, time) {
  if (Notification.permission === 'granted') {
    new Notification(`Waktunya minum obat`, {
      body: `Saatnya minum ${medicine.name} (${time})`
    });
  }
}

function clearAllScheduledNotifications() {
  notificationTimeoutIds.forEach(id => clearTimeout(id));
  notificationTimeoutIds = [];
}

// Medical Facts
function showRandomMedicalFact() {
  if (!medicalFactElement || medicalFacts.length === 0) return;
  
  const randomIndex = Math.floor(Math.random() * medicalFacts.length);
  medicalFactElement.textContent = medicalFacts[randomIndex];
  
  // Rotate facts every 30 seconds
  setInterval(() => {
    const newIndex = (randomIndex + 1) % medicalFacts.length;
    medicalFactElement.textContent = medicalFacts[newIndex];
  }, 30000);
}

// LocalStorage Functions
function saveMedicines() {
  localStorage.setItem('medicines', JSON.stringify(medicines));
}

function saveCompletedDoses() {
  localStorage.setItem('completedDoses', JSON.stringify(completedDoses));
}

function saveDailySchedules() {
  localStorage.setItem('dailySchedules', JSON.stringify(dailySchedules));
}

function saveMedicineHistory() {
  localStorage.setItem('medicineHistory', JSON.stringify(medicineHistory));
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Update days count daily
setInterval(updateDaysCount, 1000 * 60 * 60); // Check every hour