// Login button and form
const loginButtons = document.querySelectorAll('.log-in');
const formPage = document.getElementById('formPage');
const userForm = document.getElementById('userForm');

// Hide form initially
formPage.style.display = 'none';

// Attach login button listeners
function attachLoginListeners() {
    document.querySelectorAll('.log-in').forEach(btn => {
        btn.addEventListener('click', () => {
            formPage.style.display = 'flex';
            document.getElementById('name').focus();
        });
    });
}

// Render logged-in UI in all .acc elements
function renderLoggedInUI(data) {
    const accContainers = document.querySelectorAll('.acc');
    accContainers.forEach(container => {
        container.innerHTML = `
            <div class="user-profile">
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=26a69a&color=fff&rounded=true&size=40" alt="Avatar" style="border-radius: 50%; width: 40px; height: 40px; margin-right: 0.5rem;">
                <div>
                    <div class="bp-name" style="font-weight: 600;">${data.name}</div>
                    <div class="bp-id" style="font-size: 0.8rem; color: #555;">${data.bellyId}</div>
                </div>
                <button class="logoutBtn">Logout</button>
            </div>
        `;
    });

    // Update #statName and #statId if they exist
    const statName = document.getElementById('statName');
    const statId = document.getElementById('statBellyId');
    if (statName) statName.textContent = data.name;
    if (statId) statId.textContent = data.bellyId;

    // Attach logout handlers
    document.querySelectorAll('.logoutBtn').forEach(btn => {
        btn.addEventListener('click', () => {
            localStorage.removeItem('userFormData');
            resetUI();
        });
    });
}

// Reset UI back to login state
function resetUI() {
    const accContainers = document.querySelectorAll('.acc');
    accContainers.forEach(container => {
        container.innerHTML = `<button class="log-in">Log In</button>`;
    });
    attachLoginListeners();
}

// Handle form submit
userForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const data = {
        name: document.getElementById('name').value || "Anonymous",
        bellyId: document.getElementById('bellyId').value || "0000"
    };
    localStorage.setItem('userFormData', JSON.stringify(data));
    renderLoggedInUI(data);
    formPage.style.display = 'none';
    alert("Berhasil login!");
});

// Close form button
const closeFormButton = document.querySelector("#formPage button[type='button']");
closeFormButton.addEventListener('click', () => {
    formPage.style.display = 'none';
});

// On page load
document.addEventListener('DOMContentLoaded', () => {
    const storedData = localStorage.getItem('userFormData');
    if (storedData) {
        const data = JSON.parse(storedData);
        renderLoggedInUI(data);
    } else {
        attachLoginListeners();
    }
});
