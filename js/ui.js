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

