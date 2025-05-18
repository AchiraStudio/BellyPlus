document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const menuToggle = document.getElementById('menuToggle');
    const appSidebar = document.querySelector('.app-sidebar');
    const addBabyBtn = document.getElementById('addBabyBtn');
    const babySelector = document.getElementById('babySelector');
    const addBabyModal = document.getElementById('addBabyModal');
    const saveBabyBtn = document.getElementById('saveBabyBtn');
    const closeModalButtons = document.querySelectorAll('.close-modal, .cancel-btn');
    const tabLinks = document.querySelectorAll('.sidebar-nav a');
    const tabContents = document.querySelectorAll('.tab-content');
    const addGrowthModal = document.getElementById('addGrowthModal');
    const saveGrowthBtn = document.getElementById('saveGrowthBtn');
    const growthChartType = document.getElementById('growthChartType');
    
    // State
    let babies = JSON.parse(localStorage.getItem('babies')) || [];
    let currentBabyId = localStorage.getItem('currentBabyId') || null;
    let growthChart = null;
    
    // Initialize the app
    initApp();
    
    // Event Listeners
    menuToggle.addEventListener('click', function() {
        appSidebar.classList.toggle('active');
    });
    
    addBabyBtn.addEventListener('click', function() {
        addBabyModal.classList.add('active');
    });
    
    saveBabyBtn.addEventListener('click', saveBaby);
    
    babySelector.addEventListener('click', function() {
        if (babies.length > 0) {
            showBabySelectionMenu();
        } else {
            addBabyModal.classList.add('active');
        }
    });
    
    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.remove('active');
            });
        });
    });
    
    tabLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    growthChartType.addEventListener('change', function() {
        if (currentBabyId) {
            renderGrowthChart();
        }
    });
    
    saveGrowthBtn.addEventListener('click', saveGrowthData);
    
    // Functions
    function initApp() {
        // Load babies from localStorage
        if (babies.length > 0) {
            if (!currentBabyId) {
                currentBabyId = babies[0].id;
                localStorage.setItem('currentBabyId', currentBabyId);
            }
            updateBabySelector();
            loadBabyData(currentBabyId);
        } else {
            showNoBabyMessage();
        }
    }
    
    function switchTab(tabId) {
        // Update active tab in sidebar
        tabLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-tab') === tabId) {
                link.classList.add('active');
            }
        });
        
        // Show corresponding content
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.getAttribute('data-tab') === tabId) {
                content.classList.add('active');
            }
        });
        
        // Special handling for certain tabs
        if (tabId === 'growth-charts' && currentBabyId) {
            renderGrowthChart();
        }
    }
    
    function showNoBabyMessage() {
      // Hide all baby-specific content
      document.querySelectorAll('.no-baby-message').forEach(el => {
          el.style.display = 'block';
      });
      document.querySelectorAll('.growth-content, .milestones-content, .weekly-content, .chart-container, .vaccinations-content, .milestones-tab-content, .tips-tab-content').forEach(el => {
          el.style.display = 'none';
      });
      
      // Update baby selector
      const babyInfo = babySelector.querySelector('.baby-info');
      babyInfo.querySelector('.name').textContent = 'Tidak ada bayi terpilih';
      babyInfo.querySelector('.age').textContent = 'Tambahkan bayi untuk memulai';
      
      // Clear any existing chart
      if (growthChart) {
          growthChart.destroy();
          growthChart = null;
      }
    }
    
    function saveBaby() {
        const name = document.getElementById('babyName').value.trim();
        const birthDate = document.getElementById('babyBirthDate').value;
        const gender = document.getElementById('babyGender').value;
        const id = document.getElementById('babyId').value.trim() || generateBabyId();
        
        if (!name || !birthDate) {
            alert('Harap isi semua kolom yang diperlukan');
            return;
        }
        
        const newBaby = {
            id,
            name,
            birthDate,
            gender,
            growthData: [],
            milestones: [],
            vaccinations: []
        };
        
        babies.push(newBaby);
        localStorage.setItem('babies', JSON.stringify(babies));
        
        currentBabyId = id;
        localStorage.setItem('currentBabyId', currentBabyId);
        
        updateBabySelector();
        loadBabyData(id);
        addBabyModal.classList.remove('active');
        
        // Clear form
        document.getElementById('babyName').value = '';
        document.getElementById('babyBirthDate').value = '';
        document.getElementById('babyGender').value = 'male';
        document.getElementById('babyId').value = '';
    }
    
    function generateBabyId() {
        return 'BP-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    }
    
    function updateBabySelector() {
        if (babies.length === 0) {
            showNoBabyMessage();
            return;
        }
        
        const currentBaby = babies.find(baby => baby.id === currentBabyId) || babies[0];
        const babyInfo = babySelector.querySelector('.baby-info');
        
        // Calculate age
        const birthDate = new Date(currentBaby.birthDate);
        const today = new Date();
        let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
        months -= birthDate.getMonth();
        months += today.getMonth();
        months = months <= 0 ? 0 : months;
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        
        let ageText = '';
        if (years > 0) {
            ageText = `${years} tahun${years > 1 ? '' : ''}`;
            if (remainingMonths > 0) {
                ageText += ` ${remainingMonths} bulan${remainingMonths > 1 ? '' : ''}`;
            }
        } else {
            ageText = `${months} bulan${months !== 1 ? '' : ''}`;
        }
        
        babyInfo.querySelector('.name').textContent = currentBaby.name;
        babyInfo.querySelector('.age').textContent = `Usia ${ageText}`;
    }
    
    function showBabySelectionMenu() {
      const menu = document.createElement('div');
      menu.className = 'baby-selection-menu';
      menu.style.position = 'absolute';
      menu.style.backgroundColor = 'white';
      menu.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      menu.style.borderRadius = '8px';
      menu.style.padding = '8px 0';
      menu.style.zIndex = '1000';
      menu.style.minWidth = '240px';

      babies.forEach(baby => {
          const item = document.createElement('div');
          item.className = 'baby-menu-item';
          item.style.padding = '8px 16px';
          item.style.display = 'flex';
          item.style.alignItems = 'center';
          item.style.gap = '12px';
          item.style.cursor = 'pointer';
          item.style.position = 'relative';
          
          if (baby.id === currentBabyId) {
              item.style.backgroundColor = 'var(--primary-light)';
          }
          
          item.innerHTML = `
              <div class="baby-avatar" style="background: var(--primary-light); color: var(--primary-color);">
                  <i class="fas fa-baby"></i>
              </div>
              <div style="flex: 1;">
                  <div style="font-weight: 500;">${baby.name}</div>
                  <div style="font-size: 12px; color: var(--text-light);">${baby.id}</div>
              </div>
              <button class="delete-baby-btn" style="background: none; border: none; color: var(--danger-color); padding: 4px;">
                  <i class="fas fa-trash"></i>
              </button>
          `;
          
          const selectBaby = function() {
              currentBabyId = baby.id;
              localStorage.setItem('currentBabyId', currentBabyId);
              loadBabyData(currentBabyId);
              document.body.removeChild(menu);
          };
          
          // Click on main area selects baby
          item.querySelector('.baby-avatar').addEventListener('click', selectBaby);
          item.querySelector('div > div:first-child').addEventListener('click', selectBaby);
          
          // Delete button removes baby
          const deleteBtn = item.querySelector('.delete-baby-btn');
          deleteBtn.addEventListener('click', function(e) {
              e.stopPropagation();
              if (confirm(`Apakah Anda yakin ingin menghapus profil ${baby.name}? Tindakan ini tidak dapat dibatalkan.`)) {
                  deleteBaby(baby.id);
                  document.body.removeChild(menu);
              }
          });
          
          menu.appendChild(item);
      });
        
        const addItem = document.createElement('div');
        addItem.className = 'baby-menu-item';
        addItem.style.padding = '8px 16px';
        addItem.style.display = 'flex';
        addItem.style.alignItems = 'center';
        addItem.style.gap = '12px';
        addItem.style.cursor = 'pointer';
        addItem.style.borderTop = '1px solid var(--border-color)';
        addItem.style.marginTop = '8px';
        
        addItem.innerHTML = `
            <div class="baby-avatar" style="background: var(--primary-light); color: var(--primary-color);">
                <i class="fas fa-plus"></i>
            </div>
            <div style="font-weight: 500;">Tambah Bayi Baru</div>
        `;
        
        addItem.addEventListener('click', function() {
            addBabyModal.classList.add('active');
            document.body.removeChild(menu);
        });
        
        menu.appendChild(addItem);
        
        // Position the menu below the baby selector
        const rect = babySelector.getBoundingClientRect();
        menu.style.top = `${rect.bottom + window.scrollY + 4}px`;
        menu.style.left = `${rect.left + window.scrollX}px`;
        
        document.body.appendChild(menu);
        
        // Close menu when clicking outside
        const closeMenu = function(e) {
            if (!menu.contains(e.target)) {
                document.body.removeChild(menu);
                document.removeEventListener('click', closeMenu);
            }
        };
        
        setTimeout(() => {
            document.addEventListener('click', closeMenu);
        }, 0);
    }
    
    function deleteBaby(babyId) {
      // Remove baby from array
      babies = babies.filter(baby => baby.id !== babyId);
      localStorage.setItem('babies', JSON.stringify(babies));
      
      // If we deleted the current baby, update the UI
      if (babyId === currentBabyId) {
          if (babies.length > 0) {
              // Switch to another baby
              currentBabyId = babies[0].id;
              localStorage.setItem('currentBabyId', currentBabyId);
              loadBabyData(currentBabyId);
          } else {
              // No babies left
              currentBabyId = null;
              localStorage.removeItem('currentBabyId');
              showNoBabyMessage();
          }
      }
    }
    
    function loadBabyData(babyId) {
        const baby = babies.find(b => b.id === babyId);
        if (!baby) return;
        
        updateBabySelector();
        
        // Show all baby-specific content
        document.querySelectorAll('.no-baby-message').forEach(el => {
            el.style.display = 'none';
        });
        document.querySelectorAll('.growth-content, .milestones-content, .weekly-content, .chart-container, .vaccinations-content, .milestones-tab-content, .tips-tab-content').forEach(el => {
            el.style.display = 'block';
        });
        
        // Update growth summary
        updateGrowthSummary(baby);
        
        // Update milestones
        updateMilestones(baby);
        
        // Update weekly development
        updateWeeklyDevelopment(baby);
        
        // Update vaccinations
        updateVaccinations(baby);
        
        // Update tips
        updateTips(baby);
        
        // Render growth chart if on that tab
        if (document.querySelector('.growth-charts-content').classList.contains('active')) {
            renderGrowthChart();
        }
    }
    
    function updateGrowthSummary(baby) {
        const growthContent = document.querySelector('.growth-content');
        
        if (baby.growthData.length === 0) {
            growthContent.innerHTML = `
                <div class="no-data-message" style="text-align: center; padding: 20px; color: var(--text-medium);">
                    <i class="fas fa-weight" style="font-size: 24px; margin-bottom: 8px;"></i>
                    <p>Belum ada data pertumbuhan</p>
                    <button class="add-data-btn" style="margin-top: 12px; padding: 8px 16px; background: var(--primary-color); color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Tambah Data Pertumbuhan
                    </button>
                </div>
            `;
            
            growthContent.querySelector('.add-data-btn').addEventListener('click', function() {
                addGrowthModal.classList.add('active');
                document.getElementById('growthDate').valueAsDate = new Date();
            });
            return;
        }
        
        // Sort growth data by date (newest first)
        const sortedData = [...baby.growthData].sort((a, b) => new Date(b.date) - new Date(a.date));
        const latestData = sortedData[0];
        const previousData = sortedData.length > 1 ? sortedData[1] : null;
        
        // Calculate trends
        const weightTrend = previousData ? ((latestData.weight - previousData.weight) / previousData.weight * 100).toFixed(0) : 0;
        const heightTrend = previousData ? ((latestData.height - previousData.height) / previousData.height * 100).toFixed(0) : 0;
        const headTrend = previousData ? ((latestData.headCircumference - previousData.headCircumference) / previousData.headCircumference * 100).toFixed(0) : 0;
        
        // Calculate overall growth progress (simplified)
        const ageInMonths = calculateAgeInMonths(baby.birthDate);
        const progressPercentage = Math.min(100, Math.max(0, ageInMonths * 5)); // Simplified calculation
        
        growthContent.innerHTML = `
            <div class="growth-stats">
                <div class="stat">
                    <div class="stat-value">${latestData.weight.toFixed(1)}<span>kg</span></div>
                    <div class="stat-label">Berat</div>
                    <div class="stat-trend ${weightTrend > 0 ? 'up' : weightTrend < 0 ? 'down' : 'neutral'}">
                        <i class="fas fa-arrow-${weightTrend > 0 ? 'up' : weightTrend < 0 ? 'down' : 'minus'}"></i> ${Math.abs(weightTrend)}%
                    </div>
                </div>
                <div class="stat">
                    <div class="stat-value">${latestData.height}<span>cm</span></div>
                    <div class="stat-label">Tinggi</div>
                    <div class="stat-trend ${heightTrend > 0 ? 'up' : heightTrend < 0 ? 'down' : 'neutral'}">
                        <i class="fas fa-arrow-${heightTrend > 0 ? 'up' : heightTrend < 0 ? 'down' : 'minus'}"></i> ${Math.abs(heightTrend)}%
                    </div>
                </div>
                <div class="stat">
                    <div class="stat-value">${latestData.headCircumference.toFixed(1)}<span>cm</span></div>
                    <div class="stat-label">Lingkar Kepala</div>
                    <div class="stat-trend ${headTrend > 0 ? 'up' : headTrend < 0 ? 'down' : 'neutral'}">
                        <i class="fas fa-arrow-${headTrend > 0 ? 'up' : headTrend < 0 ? 'down' : 'minus'}"></i> ${Math.abs(headTrend)}%
                    </div>
                </div>
            </div>
            <div class="growth-progress">
                <div class="progress-info">
                    <span>Perkembangan Keseluruhan</span>
                    <span>${progressPercentage}% Selesai</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                </div>
                <div class="percentile-info">
                    <i class="fas fa-info-circle"></i>
                    <span>Bayi Anda berada di persentil ke-${getRandomPercentile()}</span>
                </div>
            </div>
            <button class="add-data-btn" style="margin-top: 16px; padding: 8px 16px; background: var(--primary-color); color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;">
                Tambah Data Pertumbuhan Baru
            </button>
        `;
        
        growthContent.querySelector('.add-data-btn').addEventListener('click', function() {
            addGrowthModal.classList.add('active');
            document.getElementById('growthDate').valueAsDate = new Date();
        });
    }
    
    function calculateAgeInMonths(birthDate) {
        const birth = new Date(birthDate);
        const today = new Date();
        let months = (today.getFullYear() - birth.getFullYear()) * 12;
        months -= birth.getMonth();
        months += today.getMonth();
        return months <= 0 ? 0 : months;
    }
    
    function getRandomPercentile() {
        // Returns a random percentile between 25th and 95th for demo purposes
        return Math.floor(Math.random() * 70) + 25;
    }
    
    function updateMilestones(baby) {
        const milestonesContent = document.querySelector('.milestones-content');
        
        // Default milestones based on age
        const ageInMonths = calculateAgeInMonths(baby.birthDate);
        const defaultMilestones = getDefaultMilestones(ageInMonths);
        
        // Merge with any saved milestones
        const allMilestones = [...defaultMilestones];
        if (baby.milestones && baby.milestones.length > 0) {
            baby.milestones.forEach(savedMilestone => {
                const existingIndex = allMilestones.findIndex(m => m.id === savedMilestone.id);
                if (existingIndex >= 0) {
                    allMilestones[existingIndex] = {...allMilestones[existingIndex], ...savedMilestone};
                } else {
                    allMilestones.push(savedMilestone);
                }
            });
        }
        
        // Sort milestones: completed first, then current, then upcoming
        allMilestones.sort((a, b) => {
            if (a.status === 'completed' && b.status !== 'completed') return -1;
            if (a.status !== 'completed' && b.status === 'completed') return 1;
            if (a.status === 'current' && b.status !== 'current') return -1;
            if (a.status !== 'current' && b.status === 'current') return 1;
            return 0;
        });
        
        // Render milestones
        let milestonesHTML = '';
        allMilestones.forEach(milestone => {
            const statusClass = milestone.status === 'completed' ? 'completed' : milestone.status === 'current' ? 'current' : '';
            const icon = milestone.status === 'completed' ? 'fa-check-circle' : milestone.status === 'current' ? 'fa-adjust' : 'fa-circle';
            
            milestonesHTML += `
                <div class="milestone-item ${statusClass}">
                    <div class="milestone-icon">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="milestone-details">
                        <h4>${milestone.title}</h4>
                        <p>${milestone.description}</p>
                        ${milestone.status === 'completed' ? 
                          `<span class="milestone-date">Selesai ${formatDate(milestone.completedDate)}</span>` : 
                          `<span class="milestone-date">Diperkirakan ${milestone.expectedTime}</span>`}
                    </div>
                </div>
            `;
        });
        
        milestonesContent.innerHTML = `
            <div class="milestones-list">
                ${milestonesHTML}
            </div>
            <button class="view-all-btn">
                Lihat Semua Pencapaian
                <i class="fas fa-arrow-right"></i>
            </button>
        `;
    }
    
    function getDefaultMilestones(ageInMonths) {
        // This is a simplified version - in a real app, you'd have a more comprehensive list
        const milestones = [
            {
                id: 'first-smile',
                title: 'Senyum Sosial Pertama',
                description: 'Merespon pengasuh dengan senyuman',
                expectedTime: 'sekitar 2 bulan',
                status: ageInMonths >= 2 ? 'completed' : ageInMonths >= 1 ? 'current' : 'upcoming'
            },
            {
                id: 'head-control',
                title: 'Kontrol Kepala',
                description: 'Dapat menahan kepala dengan stabil saat tengkurap',
                expectedTime: 'sekitar 4 bulan',
                status: ageInMonths >= 4 ? 'completed' : ageInMonths >= 2 ? 'current' : 'upcoming'
            },
            {
                id: 'rolling-over',
                title: 'Berguling',
                description: 'Dari posisi tengkurap ke terlentang',
                expectedTime: 'sekitar 5 bulan',
                status: ageInMonths >= 5 ? 'completed' : ageInMonths >= 3 ? 'current' : 'upcoming'
            },
            {
                id: 'sitting-up',
                title: 'Duduk',
                description: 'Duduk tanpa bantuan',
                expectedTime: 'sekitar 7 bulan',
                status: ageInMonths >= 7 ? 'completed' : ageInMonths >= 5 ? 'current' : 'upcoming'
            }
        ];
        
        // Only show milestones that are relevant (completed, current, or upcoming soon)
        return milestones.filter(m => 
            m.status === 'completed' || 
            m.status === 'current' || 
            (m.status === 'upcoming' && ageInMonths >= getExpectedMonth(m.expectedTime) - 2)
        );
    }
    
    function getExpectedMonth(expectedTime) {
        // Extract month number from strings like "around 4 months"
        const match = expectedTime.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
    }
    
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    
    function updateWeeklyDevelopment(baby) {
        const weeklyContent = document.querySelector('.weekly-content');
        const ageInWeeks = Math.floor(calculateAgeInMonths(baby.birthDate) * 4.34524); // Approximate
        
        weeklyContent.innerHTML = `
            <div class="week-nav">
                <button class="icon-btn">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <span class="current-week">Minggu ${ageInWeeks}</span>
                <button class="icon-btn">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
            <div class="development-highlights">
                <div class="highlight">
                    <div class="highlight-icon cognitive">
                        <i class="fas fa-brain"></i>
                    </div>
                    <div class="highlight-details">
                        <h4>Kognitif</h4>
                        <p>${getCognitiveDevelopment(ageInWeeks)}</p>
                    </div>
                </div>
                <div class="highlight">
                    <div class="highlight-icon motor">
                        <i class="fas fa-hand-paper"></i>
                    </div>
                    <div class="highlight-details">
                        <h4>Motorik</h4>
                        <p>${getMotorDevelopment(ageInWeeks)}</p>
                    </div>
                </div>
                <div class="highlight">
                    <div class="highlight-icon social">
                        <i class="fas fa-comment-dots"></i>
                    </div>
                    <div class="highlight-details">
                        <h4>Sosial & Bahasa</h4>
                        <p>${getSocialDevelopment(ageInWeeks)}</p>
                    </div>
                </div>
            </div>
            <div class="activity-suggestions">
                <h4>Aktivitas yang Direkomendasikan</h4>
                <div class="activities">
                    <div class="activity">
                        <div class="activity-icon">
                            <i class="fas fa-mobile-alt"></i>
                        </div>
                        <p>${getActivitySuggestion(ageInWeeks, 'visual')}</p>
                    </div>
                    <div class="activity">
                        <div class="activity-icon">
                            <i class="fas fa-music"></i>
                        </div>
                        <p>${getActivitySuggestion(ageInWeeks, 'auditory')}</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    function getCognitiveDevelopment(weeks) {
        if (weeks < 8) return 'Mulai fokus pada wajah dan benda';
        if (weeks < 16) return 'Mengikuti benda bergerak dengan mata';
        if (weeks < 24) return 'Menunjukkan rasa ingin tahu terhadap lingkungan';
        if (weeks < 32) return 'Memahami konsep keberadaan objek';
        return 'Mengembangkan kemampuan memecahkan masalah';
    }
    
    function getMotorDevelopment(weeks) {
        if (weeks < 8) return 'Menggerakkan lengan dan kaki secara acak';
        if (weeks < 16) return 'Dapat menahan kepala saat tengkurap';
        if (weeks < 24) return 'Meraih dan menggenggam benda';
        if (weeks < 32) return 'Berguling ke dua arah';
        return 'Mungkin sudah merangkak atau mencoba berdiri';
    }
    
    function getSocialDevelopment(weeks) {
        if (weeks < 8) return 'Melakukan kontak mata';
        if (weeks < 16) return 'Tersenyum secara sosial';
        if (weeks < 24) return 'Tertawa dan bersuara';
        if (weeks < 32) return 'Merespon ketika dipanggil namanya';
        return 'Mungkin menunjukkan kecemasan terhadap orang asing';
    }
    
    function getActivitySuggestion(weeks, type) {
        if (type === 'visual') {
            if (weeks < 12) return 'Gunakan gambar hitam putih dengan kontras tinggi';
            if (weeks < 24) return 'Tunjukkan mainan dan buku berwarna-warni';
            return 'Mainkan cilukba untuk mengembangkan pemahaman keberadaan objek';
        } else {
            if (weeks < 12) return 'Sering berbicara dan menyanyi untuk bayi Anda';
            if (weeks < 24) return 'Mainkan dengan mainan yang berbunyi';
            return 'Tanggapi ocehan bayi untuk mendorong perkembangan bahasa';
        }
    }
    
    function updateVaccinations(baby) {
        const vaccinationsContent = document.querySelector('.vaccinations-content');
        
        // Default vaccination schedule
        const defaultVaccinations = getDefaultVaccinationSchedule(baby.birthDate);
        
        // Merge with any saved vaccinations
        const allVaccinations = [...defaultVaccinations];
        if (baby.vaccinations && baby.vaccinations.length > 0) {
            baby.vaccinations.forEach(savedVaccination => {
                const existingIndex = allVaccinations.findIndex(v => v.id === savedVaccination.id);
                if (existingIndex >= 0) {
                    allVaccinations[existingIndex] = {...allVaccinations[existingIndex], ...savedVaccination};
                } else {
                    allVaccinations.push(savedVaccination);
                }
            });
        }
        
        // Calculate stats
        const completed = allVaccinations.filter(v => v.status === 'completed').length;
        const upcoming = allVaccinations.filter(v => v.status === 'upcoming').length;
        const overdue = allVaccinations.filter(v => v.status === 'overdue').length;
        const completionPercentage = Math.round((completed / allVaccinations.length) * 100);
        
        // Find next vaccination
        const nextVaccination = allVaccinations.find(v => v.status === 'upcoming' || v.status === 'overdue');
        
        vaccinationsContent.innerHTML = `
            <div class="vaccination-progress">
                <div class="progress-circle">
                    <svg viewBox="0 0 36 36" class="circular-chart">
                        <path class="circle-bg"
                            d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path class="circle-fill"
                            stroke-dasharray="${completionPercentage}, 100"
                            d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                    </svg>
                    <div class="progress-text">${completionPercentage}%</div>
                </div>
                <div class="vaccination-details">
                    <div class="detail">
                        <span class="count">${completed}</span>
                        <span class="label">Selesai</span>
                    </div>
                    <div class="detail">
                        <span class="count">${upcoming}</span>
                        <span class="label">Akan Datang</span>
                    </div>
                    <div class="detail">
                        <span class="count">${overdue}</span>
                        <span class="label">Terlambat</span>
                    </div>
                </div>
            </div>
            <div class="next-vaccination">
                <h4>${nextVaccination ? 'Vaksinasi Berikutnya' : 'Semua vaksinasi selesai!'}</h4>
                ${nextVaccination ? `
                <div class="vaccine-card">
                    <div class="vaccine-icon">
                        <i class="fas fa-syringe"></i>
                    </div>
                    <div class="vaccine-info">
                        <h5>${nextVaccination.name}</h5>
                        <p>${nextVaccination.description}</p>
                    </div>
                    <div class="vaccine-date">
                        <span>${getVaccineDueText(nextVaccination)}</span>
                        <button class="remind-btn">Atur Pengingat</button>
                    </div>
                </div>
                ` : ''}
            </div>
        `;
        
        if (nextVaccination) {
            vaccinationsContent.querySelector('.remind-btn').addEventListener('click', function() {
                alert(`Pengingat diatur untuk vaksinasi ${nextVaccination.name}`);
            });
        }
    }
    
    function getDefaultVaccinationSchedule(birthDate) {
        const birth = new Date(birthDate);
        const today = new Date();
        
        return [
            {
                id: 'hep-b-1',
                name: 'HepB #1',
                description: 'Hepatitis B',
                recommendedDate: new Date(birth.getTime()),
                status: getVaccineStatus(birth, today)
            },
            {
                id: 'dtap-1',
                name: 'DTaP #1',
                description: 'Difteri, Tetanus & Pertusis',
                recommendedDate: new Date(birth.getFullYear(), birth.getMonth() + 2, birth.getDate()),
                status: getVaccineStatus(new Date(birth.getFullYear(), birth.getMonth() + 2, birth.getDate()), today)
            },
            {
                id: 'hib-1',
                name: 'Hib #1',
                description: 'Haemophilus influenzae tipe b',
                recommendedDate: new Date(birth.getFullYear(), birth.getMonth() + 2, birth.getDate()),
                status: getVaccineStatus(new Date(birth.getFullYear(), birth.getMonth() + 2, birth.getDate()), today)
            },
            {
                id: 'ipv-1',
                name: 'IPV #1',
                description: 'Polio',
                recommendedDate: new Date(birth.getFullYear(), birth.getMonth() + 2, birth.getDate()),
                status: getVaccineStatus(new Date(birth.getFullYear(), birth.getMonth() + 2, birth.getDate()), today)
            },
            {
                id: 'pcv13-1',
                name: 'PCV13 #1',
                description: 'Pneumokokus konjugasi',
                recommendedDate: new Date(birth.getFullYear(), birth.getMonth() + 2, birth.getDate()),
                status: getVaccineStatus(new Date(birth.getFullYear(), birth.getMonth() + 2, birth.getDate()), today)
            },
            {
                id: 'rv-1',
                name: 'RV #1',
                description: 'Rotavirus',
                recommendedDate: new Date(birth.getFullYear(), birth.getMonth() + 2, birth.getDate()),
                status: getVaccineStatus(new Date(birth.getFullYear(), birth.getMonth() + 2, birth.getDate()), today)
            }
        ];
    }
    
    function getVaccineStatus(recommendedDate, today) {
        if (today < recommendedDate) return 'upcoming';
        const daysOverdue = Math.floor((today - recommendedDate) / (1000 * 60 * 60 * 24));
        return daysOverdue > 30 ? 'overdue' : 'upcoming';
    }
    
    function getVaccineDueText(vaccine) {
        const today = new Date();
        if (today >= vaccine.recommendedDate) {
            const daysOverdue = Math.floor((today - vaccine.recommendedDate) / (1000 * 60 * 60 * 24));
            return `Terlambat ${daysOverdue} hari`;
        } else {
            const daysUntil = Math.ceil((vaccine.recommendedDate - today) / (1000 * 60 * 60 * 24));
            return `Jatuh tempo dalam ${daysUntil} hari`;
        }
    }
    
    function updateTips(baby) {
        const tipsContent = document.querySelector('.tips-tab-content');
        const ageInMonths = calculateAgeInMonths(baby.birthDate);
        
        const tips = getAgeAppropriateTips(ageInMonths);
        
        let tipsHTML = '';
        tips.forEach((tip, index) => {
            tipsHTML += `
                <div class="tip">
                    <div class="tip-icon">
                        <i class="fas ${tip.icon}"></i>
                    </div>
                    <div class="tip-content">
                        <h4>${tip.title}</h4>
                        <p>${tip.content}</p>
                    </div>
                </div>
            `;
        });
        
        tipsContent.innerHTML = `
            <div class="tips-list">
                ${tipsHTML}
            </div>
            <button class="view-all-btn">
                Lihat Semua Tips
                <i class="fas fa-arrow-right"></i>
            </button>
        `;
    }
    
    function getAgeAppropriateTips(ageInMonths) {
        // This is a simplified version - in a real app, you'd have a more comprehensive list
        if (ageInMonths < 3) {
            return [
                {
                    icon: 'fa-bed',
                    title: 'Keamanan Tidur',
                    content: 'Selalu baringkan bayi dalam posisi telentang dan jaga tempat tidur bebas dari selimut dan mainan.'
                },
                {
                    icon: 'fa-utensils',
                    title: 'Menyusui',
                    content: 'Berikan ASI sesuai permintaan, biasanya setiap 2-3 jam. Perhatikan tanda lapar seperti mencari-cari dan menghisap tangan.'
                },
                {
                    icon: 'fa-child',
                    title: 'Tummy Time',
                    content: 'Mulailah dengan 3-5 menit tengkurap 2-3 kali sehari untuk memperkuat otot leher dan bahu.'
                }
            ];
        } else if (ageInMonths < 6) {
            return [
                {
                    icon: 'fa-utensils',
                    title: 'Pola Menyusui',
                    content: 'Bayi mungkin mulai mengembangkan jadwal menyusui yang lebih teratur, biasanya setiap 3-4 jam.'
                },
                {
                    icon: 'fa-book',
                    title: 'Literasi Dini',
                    content: 'Bacakan untuk bayi Anda setiap hari. Buku dengan gambar kontras tinggi bagus untuk usia ini.'
                },
                {
                    icon: 'fa-music',
                    title: 'Musik dan Bermain',
                    content: 'Nyanyikan lagu dan mainkan dengan mainan kerincingan untuk mendorong perkembangan pendengaran dan koordinasi mata-tangan.'
                }
            ];
        } else {
            return [
                {
                    icon: 'fa-utensils',
                    title: 'Memulai MPASI',
                    content: 'Perkenalkan makanan tunggal seperti sereal yang diperkaya zat besi, buah dan sayuran yang dihaluskan.'
                },
                {
                    icon: 'fa-child',
                    title: 'Perkembangan Fisik',
                    content: 'Dukung bayi untuk duduk dengan bantuan dan berikan banyak waktu di lantai untuk berguling dan merayap.'
                },
                {
                    icon: 'fa-comment',
                    title: 'Perkembangan Bahasa',
                    content: 'Tanggapi ocehan bayi dan tirukan suaranya untuk mendorong "percakapan" timbal balik.'
                }
            ];
        }
    }
    
    function renderGrowthChart() {
        const baby = babies.find(b => b.id === currentBabyId);
        if (!baby || baby.growthData.length === 0) {
            document.querySelector('.chart-container').innerHTML = `
                <div class="no-data-message" style="text-align: center; padding: 40px 20px; color: var(--text-medium);">
                    <i class="fas fa-chart-line" style="font-size: 24px; margin-bottom: 8px;"></i>
                    <p>Belum ada data pertumbuhan</p>
                    <button class="add-data-btn" style="margin-top: 12px; padding: 8px 16px; background: var(--primary-color); color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Tambah Data Pertumbuhan
                    </button>
                </div>
            `;
            
            document.querySelector('.chart-container .add-data-btn').addEventListener('click', function() {
                addGrowthModal.classList.add('active');
                document.getElementById('growthDate').valueAsDate = new Date();
            });
            return;
        }
        
        const ctx = document.getElementById('growthChartCanvas').getContext('2d');
        const chartType = growthChartType.value;
        
        // Sort growth data by date
        const sortedData = [...baby.growthData].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Prepare chart data
        const labels = sortedData.map(data => formatDate(data.date));
        const babyData = sortedData.map(data => data[chartType]);
        
        // Generate average data for comparison
        const averageData = generateAverageData(chartType, baby.birthDate, baby.gender, sortedData);
        
        if (growthChart) {
            growthChart.destroy();
        }
        
        growthChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Bayi Anda',
                        data: babyData,
                        borderColor: 'var(--primary-color)',
                        backgroundColor: 'rgba(255, 107, 139, 0.1)',
                        tension: 0.3,
                        fill: true
                    },
                    {
                        label: 'Rata-rata',
                        data: averageData,
                        borderColor: 'var(--text-light)',
                        backgroundColor: 'rgba(178, 190, 195, 0.1)',
                        borderDash: [5, 5],
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: chartType === 'weight' ? 'Berat (kg)' : 
                                  chartType === 'height' ? 'Tinggi (cm)' : 'Lingkar Kepala (cm)'
                        }
                    }
                }
            }
        });
    }
    
    function generateAverageData(chartType, birthDate, gender, babyData) {
        // This is a simplified version - in a real app, you'd use actual growth charts data
        const birth = new Date(birthDate);
        const ageInMonthsAtDataPoints = babyData.map(data => {
            const dataDate = new Date(data.date);
            return (dataDate.getFullYear() - birth.getFullYear()) * 12 + 
                   (dataDate.getMonth() - birth.getMonth());
        });
        
        // Generate "average" values based on WHO growth standards (simplified)
        return ageInMonthsAtDataPoints.map(ageInMonths => {
            if (chartType === 'weight') {
                // Weight in kg - simplified average
                if (ageInMonths < 1) return gender === 'male' ? 3.5 : 3.4;
                if (ageInMonths < 2) return gender === 'male' ? 4.5 : 4.2;
                if (ageInMonths < 4) return gender === 'male' ? 5.6 : 5.1;
                if (ageInMonths < 6) return gender === 'male' ? 6.7 : 6.2;
                if (ageInMonths < 9) return gender === 'male' ? 7.8 : 7.2;
                return gender === 'male' ? 8.5 : 7.9;
            } else if (chartType === 'height') {
                // Height in cm - simplified average
                if (ageInMonths < 1) return gender === 'male' ? 52 : 51;
                if (ageInMonths < 2) return gender === 'male' ? 56 : 55;
                if (ageInMonths < 4) return gender === 'male' ? 62 : 61;
                if (ageInMonths < 6) return gender === 'male' ? 67 : 65;
                if (ageInMonths < 9) return gender === 'male' ? 71 : 69;
                return gender === 'male' ? 74 : 72;
            } else {
                // Head circumference in cm - simplified average
                if (ageInMonths < 1) return gender === 'male' ? 36 : 35;
                if (ageInMonths < 2) return gender === 'male' ? 38 : 37;
                if (ageInMonths < 4) return gender === 'male' ? 41 : 40;
                if (ageInMonths < 6) return gender === 'male' ? 43 : 42;
                if (ageInMonths < 9) return gender === 'male' ? 45 : 44;
                return gender === 'male' ? 46 : 45;
            }
        });
    }
    
    function saveGrowthData() {
        const date = document.getElementById('growthDate').value;
        const weight = parseFloat(document.getElementById('growthWeight').value);
        const height = parseInt(document.getElementById('growthHeight').value);
        const headCircumference = parseFloat(document.getElementById('growthHead').value);
        
        if (!date || isNaN(weight)) {
            alert('Harap isi setidaknya tanggal dan berat');
            return;
        }
        
        const babyIndex = babies.findIndex(b => b.id === currentBabyId);
        if (babyIndex === -1) return;
        
        const newGrowthData = {
            date,
            weight,
            height: isNaN(height) ? null : height,
            headCircumference: isNaN(headCircumference) ? null : headCircumference
        };
        
        babies[babyIndex].growthData.push(newGrowthData);
        localStorage.setItem('babies', JSON.stringify(babies));
        
        loadBabyData(currentBabyId);
        addGrowthModal.classList.remove('active');
        
        // Clear form
        document.getElementById('growthDate').value = '';
        document.getElementById('growthWeight').value = '';
        document.getElementById('growthHeight').value = '';
        document.getElementById('growthHead').value = '';
    }
});