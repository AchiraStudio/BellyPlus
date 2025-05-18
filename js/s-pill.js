// DOM Elements
const medicineModal = document.getElementById('medicineModal');
const closeMedicineModal = document.getElementById('closeMedicineModal');
const medicineForm = document.getElementById('medicineForm');
const addMedicineBtn = document.getElementById('addMedicineBtn');
const addFirstMedicineBtn = document.getElementById('addFirstMedicineBtn');
const changeMedicineBtn = document.getElementById('changeMedicineBtn');
const editMedicineBtn = document.getElementById('editMedicineBtn');
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

// State
let medicines = [];
let selectedMedicineId = null;
let completedDoses = [];
let startDate = null;

// Initialize the application
function initApp() {
  // Hide modals by default
  if (medicineModal) medicineModal.classList.remove('show');
  if (selectMedicineModal) selectMedicineModal.classList.remove('show');
  
  loadFromLocalStorage();
  updateCurrentDate();
  initButtons();
}

// Load data from localStorage
function loadFromLocalStorage() {
  const storedMedicines = localStorage.getItem('medicines');
  const storedSelectedMedicine = localStorage.getItem('selectedMedicineId');
  const storedCompletedDoses = localStorage.getItem('completedDoses');
  const storedStartDate = localStorage.getItem('startDate');

  if (storedMedicines) {
    medicines = JSON.parse(storedMedicines);
    if (statPills) statPills.textContent = medicines.length;
  }

  if (storedSelectedMedicine) {
    selectedMedicineId = storedSelectedMedicine;
    const selectedMed = medicines.find(m => m.id === selectedMedicineId);
    if (selectedMed) {
      showMedicineContent(selectedMed);
    }
  }

  if (storedCompletedDoses) {
    completedDoses = JSON.parse(storedCompletedDoses);
  }

  if (storedStartDate) {
    startDate = new Date(storedStartDate);
  } else {
    startDate = new Date();
    localStorage.setItem('startDate', startDate.toISOString());
  }
  updateDaysCount();
}

// Initialize all button event listeners
function initButtons() {
  // Medicine management buttons
  if (addMedicineBtn) {
    addMedicineBtn.addEventListener('click', openAddMedicineModal);
  }

  if (addFirstMedicineBtn) {
    addFirstMedicineBtn.addEventListener('click', openAddMedicineModal);
  }

  if (changeMedicineBtn) {
    changeMedicineBtn.addEventListener('click', openMedicineSelectionModal);
  }

  if (editMedicineBtn) {
    editMedicineBtn.addEventListener('click', openEditMedicineModal);
  }

  // Modal control buttons
  if (closeMedicineModal) {
    closeMedicineModal.addEventListener('click', () => medicineModal.classList.remove('show'));
  }

  if (closeSelectMedicineModal) {
    closeSelectMedicineModal.addEventListener('click', () => selectMedicineModal.classList.remove('show'));
  }

  if (cancelMedicineBtn) {
    cancelMedicineBtn.addEventListener('click', () => medicineModal.classList.remove('show'));
  }

  // Form submission
  if (medicineForm) {
    medicineForm.addEventListener('submit', handleMedicineFormSubmit);
  }

  // Add new medicine from list button
  if (addNewMedicineFromListBtn) {
    addNewMedicineFromListBtn.addEventListener('click', () => {
      selectMedicineModal.classList.remove('show');
      openAddMedicineModal();
    });
  }
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
    document.getElementById('medicineTypeInput').value = medicine.type;
    document.getElementById('medicineBenefitInput').value = medicine.benefit;
    document.getElementById('medicineInstructionInput').value = medicine.instruction;
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

function handleMedicineFormSubmit(e) {
  e.preventDefault();
  
  const id = document.getElementById('medicineEditId').value || Date.now().toString();
  const name = document.getElementById('medicineNameInput').value;
  const type = document.getElementById('medicineTypeInput').value;
  const benefit = document.getElementById('medicineBenefitInput').value;
  const instruction = document.getElementById('medicineInstructionInput').value;
  const frequency = document.getElementById('medicineFrequencyInput').value;
  
  const medicine = {
    id,
    name,
    type,
    benefit,
    instruction,
    frequency: parseInt(frequency)
  };
  
  // Update or add medicine
  if (document.getElementById('medicineEditId').value) {
    const index = medicines.findIndex(m => m.id === id);
    if (index !== -1) medicines[index] = medicine;
  } else {
    medicines.push(medicine);
    if (statPills) statPills.textContent = medicines.length;
  }
  
  saveMedicines();
  
  // Select and show the medicine
  selectedMedicineId = id;
  localStorage.setItem('selectedMedicineId', id);
  showMedicineContent(medicine);
  
  medicineModal.classList.remove('show');
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

// Show medicine content and schedule
function showMedicineContent(medicine) {
  renderMedicineInfo(medicine);
  renderSchedule(medicine);
  if (medicineEmptyState) medicineEmptyState.style.display = 'none';
  if (medicineContent) medicineContent.style.display = 'block';
  if (scheduleEmptyState) scheduleEmptyState.style.display = 'none';
  if (scheduleContent) scheduleContent.style.display = 'block';
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
    case 1:
      frequencyText = '1x sehari (Pagi)';
      break;
    case 2:
      frequencyText = '2x sehari (Pagi & Malam)';
      break;
    case 3:
      frequencyText = '3x sehari (Pagi, Siang, Malam)';
      break;
    case 4:
      frequencyText = '4x sehari (Pagi, Siang, Sore, Malam)';
      break;
    default:
      frequencyText = `${medicine.frequency}x sehari`;
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
  
  scheduleList.innerHTML = '';
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const timeSlots = [];
  
  // Get completed doses for today
  const todayCompleted = completedDoses.filter(d => d.date === today && d.medicineId === medicine.id);
  
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
  let completedCount = 0;
  
  // Render each time slot
  timeSlots.forEach(slot => {
    const [hour, minute] = slot.time.split(':').map(Number);
    const slotTime = hour * 60 + minute;
    const isCompleted = todayCompleted.some(d => d.time === slot.time);
    const isUpcoming = !isCompleted && slotTime > currentTime;
    const isMissed = !isCompleted && slotTime < currentTime - 30; // 30 minutes grace period
    
    if (isCompleted) completedCount++;
    
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
  
  completedDoses.push({
    medicineId,
    date: today,
    time,
    completedAt: new Date().toISOString()
  });
  
  saveCompletedDoses();
  
  const medicine = medicines.find(m => m.id === medicineId);
  if (medicine) renderSchedule(medicine);
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

// LocalStorage Functions
function saveMedicines() {
  localStorage.setItem('medicines', JSON.stringify(medicines));
}

function saveCompletedDoses() {
  localStorage.setItem('completedDoses', JSON.stringify(completedDoses));
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Update days count daily
setInterval(updateDaysCount, 1000 * 60 * 60); // Check every hour