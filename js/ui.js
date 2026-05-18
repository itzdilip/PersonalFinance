export const renderExpenses = (expenses, onDelete) => {
    const tbody = document.getElementById('expense-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

    expenses.forEach(expense => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${new Date(expense.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
            <td><span class="category-tag">${expense.category}</span></td>
            <td>${expense.description || '-'}</td>
            <td class="text-right"><strong>₹${expense.amount.toFixed(2)}</strong></td>
            <td class="text-center">
                <button class="btn-delete" data-id="${expense.id}" title="Delete">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Add event listeners for delete buttons
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.onclick = () => onDelete(parseInt(btn.getAttribute('data-id')));
    });
};

export const updateSummary = (expenses) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyTotal = expenses
        .filter(e => {
            const d = new Date(e.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        })
        .reduce((sum, e) => sum + e.amount, 0);

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    const monthlyEl = document.getElementById('monthly-total');
    const totalEl = document.getElementById('all-time-total');
    
    if (monthlyEl) monthlyEl.textContent = `₹${monthlyTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    if (totalEl) totalEl.textContent = `₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
};

export const populateCategories = (categories) => {
    const select = document.getElementById('category');
    if (!select) return;
    select.innerHTML = '';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.name;
        option.textContent = cat.name;
        select.appendChild(option);
    });
};

let categoryChartInstance = null;
let trendChartInstance = null;

export const renderCharts = (expenses) => {
    const categoryCtx = document.getElementById('categoryChart');
    const trendCtx = document.getElementById('trendChart');

    if (!categoryCtx || !trendCtx) return;

    // 1. Category Distribution
    const catData = {};
    expenses.forEach(e => {
        catData[e.category] = (catData[e.category] || 0) + e.amount;
    });

    const catLabels = Object.keys(catData);
    const catValues = Object.values(catData);

    if (categoryChartInstance) categoryChartInstance.destroy();
    categoryChartInstance = new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
            labels: catLabels,
            datasets: [{
                data: catValues,
                backgroundColor: [
                    '#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#06b6d4',
                    '#8b5cf6', '#ec4899', '#64748b', '#f97316', '#0ea5e9'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });

    // 2. Trend (Last 7 Days)
    const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    }).reverse();

    const trendData = last7Days.map(date => {
        return expenses
            .filter(e => e.date === date)
            .reduce((sum, e) => sum + e.amount, 0);
    });

    const trendLabels = last7Days.map(date => {
        return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    });

    if (trendChartInstance) trendChartInstance.destroy();
    trendChartInstance = new Chart(trendCtx, {
        type: 'bar',
        data: {
            labels: trendLabels,
            datasets: [{
                label: 'Spending (₹)',
                data: trendData,
                backgroundColor: '#4f46e5',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
};

export const updateUserInfo = (user) => {
    const userProfile = document.getElementById('user-profile');
    const authOptions = document.getElementById('auth-options');
    const userNameEl = document.getElementById('user-name');
    const userAvatarEl = document.getElementById('user-avatar');
    const userIconEl = document.getElementById('user-icon');
    const welcomeMsgEl = document.getElementById('welcome-msg');
    const logoutBtn = document.getElementById('logout-btn');
    const editBtn = document.getElementById('edit-name-btn');

    if (userProfile) userProfile.classList.remove('hidden');

    const showAvatar = (src) => {
        if (src) {
            userAvatarEl.src = src;
            userAvatarEl.classList.remove('hidden');
            userIconEl.classList.add('hidden');
        } else {
            userAvatarEl.classList.add('hidden');
            userIconEl.classList.remove('hidden');
        }
    };

    if (user && user.isGoogle) {
        if (authOptions) authOptions.classList.add('hidden');
        if (logoutBtn) logoutBtn.classList.remove('hidden');
        if (editBtn) editBtn.classList.add('hidden');
        if (userNameEl) userNameEl.textContent = user.name;
        showAvatar(user.picture);
        if (welcomeMsgEl) welcomeMsgEl.textContent = `Hello, ${user.given_name || user.name}!`;
    } else {
        if (authOptions) authOptions.classList.remove('hidden');
        if (logoutBtn) logoutBtn.classList.add('hidden');
        if (editBtn) editBtn.classList.remove('hidden');
        showAvatar(null); // Use FontAwesome icon for guest
        
        const localName = user ? user.name : 'Guest';
        if (userNameEl) userNameEl.textContent = localName;
        if (welcomeMsgEl) welcomeMsgEl.textContent = `Hello, ${localName}!`;
    }
};

export const updateConnectionStatus = (isOnline) => {
    const statusEl = document.getElementById('connection-status');
    const driveBtn = document.getElementById('drive-btn');
    const offlineAuthMsg = document.getElementById('offline-auth-msg');
    const googleSigninBtn = document.querySelector('.g_id_signin');
    
    if (statusEl) {
        statusEl.className = `status-badge ${isOnline ? 'online' : 'offline'}`;
        statusEl.innerHTML = isOnline 
            ? '<i class="fas fa-wifi"></i> <span>Online</span>' 
            : '<i class="fas fa-plane"></i> <span>Offline</span>';
    }

    if (driveBtn) {
        if (!isOnline) {
            driveBtn.title = "Offline: Sync disabled";
            driveBtn.classList.add('btn-disabled');
        } else {
            driveBtn.title = "";
            driveBtn.classList.remove('btn-disabled');
        }
    }

    if (offlineAuthMsg && googleSigninBtn) {
        if (!isOnline) {
            offlineAuthMsg.classList.remove('hidden');
            googleSigninBtn.classList.add('hidden');
        } else {
            offlineAuthMsg.classList.add('hidden');
            googleSigninBtn.classList.remove('hidden');
        }
    }
};

export const toggleModal = (modalId, show) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        if (show) modal.classList.remove('hidden');
        else modal.classList.add('hidden');
    }
};

export const switchTab = (tabId) => {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === tabId);
    });
};

export const updateSettingsUI = (user, config) => {
    const settingsName = document.getElementById('settings-user-name');
    const configInput = document.getElementById('config-client-id');
    
    if (settingsName) settingsName.textContent = user.name;
    if (configInput) configInput.value = config.clientId || '';
};

export const injectGoogleAuth = (clientId) => {
    const authOptions = document.getElementById('auth-options');
    if (!authOptions || !clientId) return;

    authOptions.innerHTML = `
        <div id="g_id_onload"
             data-client_id="${clientId}"
             data-callback="handleCredentialResponse"
             data-auto_prompt="false">
        </div>
        <div class="g_id_signin"
             data-type="standard"
             data-size="medium"
             data-theme="outline"
             data-text="signin"
             data-shape="rectangular"
             data-logo_alignment="left">
        </div>
        <div id="offline-auth-msg" class="hidden">
            <p class="text-muted"><i class="fas fa-info-circle"></i> Sign-in unavailable offline</p>
        </div>
    `;
    authOptions.classList.remove('hidden');
};



