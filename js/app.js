import * as db from './db.js';
import * as ui from './ui.js';
import * as csv from './csv.js';
import * as drive from './drive.js';

// Default categories to ensure they load even if DB fails
const FALLBACK_CATEGORIES = [
    'Food & Dining', 'Transport', 'Rent', 'Bills & Utilities', 
    'Groceries', 'Shopping', 'Health', 'Insurance', 
    'Entertainment', 'Travel', 'Education', 'Investment', 'Others'
];

// Helper to decode JWT
function decodeJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Failed to decode JWT", e);
        return null;
    }
}

const init = async () => {
    // 1. Configuration & Storage
    const loadConfig = () => {
        const saved = localStorage.getItem('ff_config');
        return saved ? JSON.parse(saved) : { clientId: '' };
    };

    const saveConfig = (config) => {
        localStorage.setItem('ff_config', JSON.stringify(config));
    };

    let appConfig = loadConfig();
    const isClientConfigured = appConfig.clientId && !appConfig.clientId.includes('REPLACE_WITH');

    // 2. User & Session Management
    const loadUser = () => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : { name: 'Guest', isGoogle: false };
    };

    let currentUser = loadUser();

    try {
        console.log("Starting App Initialization...");
        
        // 3. Database & Categories
        try {
            await db.initDB();
        } catch (e) {
            console.warn("DB Initialization failed, using fallbacks:", e);
        }

        let categories = [];
        try {
            categories = await db.getCategories();
        } catch (e) {
            console.error("Failed to fetch categories:", e);
        }

        if (!categories || categories.length === 0) {
            categories = FALLBACK_CATEGORIES.map(name => ({ name }));
        }
        ui.populateCategories(categories);

        // 4. Initial UI Setup
        ui.updateUserInfo(currentUser);
        ui.updateSettingsUI(currentUser, appConfig);
        ui.updateConnectionStatus(navigator.onLine);

        if (isClientConfigured) {
            ui.injectGoogleAuth(appConfig.clientId);
        }

        // 5. Google API Init (if configured)
        const initGoogle = async () => {
            if (navigator.onLine && isClientConfigured) {
                try {
                    await drive.initGapi();
                    await drive.initGis(appConfig.clientId);
                    console.log("Google Drive API Initialized");
                    return true;
                } catch (e) {
                    console.warn("Google Drive API Init failed:", e);
                }
            }
            return false;
        };

        let googleActive = await initGoogle();

        // 6. Event Listeners
        
        // Tab Switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = () => ui.switchTab(btn.getAttribute('data-tab'));
        });

        // Connection Listeners
        window.addEventListener('online', () => ui.updateConnectionStatus(true));
        window.addEventListener('offline', () => ui.updateConnectionStatus(false));

        // Modal Listeners
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.onclick = () => ui.toggleModal('guide-modal', false);
        });

        // Google Sign-In Listener
        window.addEventListener('google-signed-in', (e) => {
            const credential = e.detail;
            const userData = decodeJwt(credential);
            if (userData) {
                currentUser = { ...userData, isGoogle: true };
                localStorage.setItem('user', JSON.stringify(currentUser));
                ui.updateUserInfo(currentUser);
                ui.updateSettingsUI(currentUser, appConfig);
            }
        });

        // Settings Actions
        const saveConfigBtn = document.getElementById('save-config-btn');
        if (saveConfigBtn) {
            saveConfigBtn.onclick = () => {
                const clientId = document.getElementById('config-client-id').value.trim();
                appConfig.clientId = clientId;
                saveConfig(appConfig);
                alert("Configuration saved! The page will reload to apply changes.");
                window.location.reload();
            };
        }

        const editNameAction = () => {
            const newName = prompt("Enter your name:", currentUser.name);
            if (newName && newName.trim()) {
                currentUser = { name: newName.trim(), isGoogle: false };
                localStorage.setItem('user', JSON.stringify(currentUser));
                ui.updateUserInfo(currentUser);
                ui.updateSettingsUI(currentUser, appConfig);
            }
        };

        const editBtn = document.getElementById('edit-name-btn');
        if (editBtn) editBtn.onclick = editNameAction;
        
        const settingsEditBtn = document.getElementById('settings-edit-name');
        if (settingsEditBtn) settingsEditBtn.onclick = editNameAction;

        const settingsGuideBtn = document.getElementById('settings-guide-btn');
        if (settingsGuideBtn) {
            settingsGuideBtn.onclick = () => ui.toggleModal('guide-modal', true);
        }

        // Logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.onclick = () => {
                localStorage.removeItem('user');
                currentUser = { name: 'Guest', isGoogle: false };
                ui.updateUserInfo(currentUser);
                window.location.reload();
            };
        }

        // 7. Core App Logic
        const refreshData = async () => {
            const expenses = await db.getAllExpenses();
            ui.renderExpenses(expenses, handleDelete);
            ui.updateSummary(expenses);
            ui.renderCharts(expenses);
        };

        const handleDelete = async (id) => {
            if (confirm("Are you sure you want to delete this transaction?")) {
                await db.deleteExpense(id);
                await refreshData();
            }
        };

        const form = document.getElementById('expense-form');
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                const amountInput = document.getElementById('amount');
                const catSelect = document.getElementById('category');
                const dateInput = document.getElementById('date');
                const descInput = document.getElementById('description');

                const expense = {
                    amount: parseFloat(amountInput.value),
                    category: catSelect.value,
                    date: dateInput.value,
                    description: descInput.value,
                    userId: currentUser.sub || 'local'
                };

                await db.addExpense(expense);
                form.reset();
                dateInput.valueAsDate = new Date();
                await refreshData();
            };
        }

        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.onclick = async () => {
                const expenses = await db.getAllExpenses();
                csv.exportToCSV(expenses, currentUser.name);
            };
        }

        const driveBtn = document.getElementById('drive-btn');
        if (driveBtn) {
            driveBtn.onclick = async () => {
                if (!navigator.onLine) {
                    alert("You are currently offline.");
                    return;
                }

                if (!isClientConfigured) {
                    if (confirm("Google Drive is not configured. Would you like to see the setup guide?")) {
                        ui.switchTab('settings');
                        ui.toggleModal('guide-modal', true);
                    }
                    return;
                }

                if (!googleActive) {
                    alert("Google API failed to initialize. Please check your Client ID in Settings.");
                    return;
                }

                const expenses = await db.getAllExpenses();
                if (expenses.length === 0) {
                    alert("No data to save.");
                    return;
                }

                try {
                    driveBtn.disabled = true;
                    driveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
                    
                    const csvContent = csv.generateCSV(expenses);
                    const safeUserName = currentUser.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                    const dateStr = new Date().toISOString().split('T')[0];
                    const fileName = `${safeUserName}_expenses_${dateStr}.csv`;

                    const fileId = await drive.uploadToDrive(csvContent, fileName);
                    alert(`Successfully saved to Google Drive! (File ID: ${fileId})`);
                } catch (error) {
                    console.error("Drive upload failed:", error);
                    alert("Failed to save to Google Drive: " + error.message);
                } finally {
                    driveBtn.disabled = false;
                    driveBtn.innerHTML = '<i class="fab fa-google-drive"></i> Save to Drive';
                }
            };
        }

        const importInput = document.getElementById('import-csv');
        if (importInput) {
            importInput.onchange = async (e) => {
                const file = e.target.files[0];
                if (file) {
                    try {
                        const expenses = await csv.parseCSV(file);
                        for (const expense of expenses) {
                            expense.userId = currentUser.sub || 'local';
                            await db.addExpense(expense);
                        }
                        await refreshData();
                        alert(`Successfully imported ${expenses.length} transactions.`);
                    } catch (error) {
                        alert("Failed to import CSV.");
                    }
                    e.target.value = '';
                }
            };
        }

        const resetBtn = document.getElementById('reset-db-btn');
        if (resetBtn) {
            resetBtn.onclick = async () => {
                if (confirm("This will delete ALL your saved data. Are you sure?")) {
                    await db.clearDatabase();
                    window.location.reload();
                }
            };
        }

        const dateInput = document.getElementById('date');
        if (dateInput) dateInput.valueAsDate = new Date();
        await refreshData();

        // 8. Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js').catch(err => console.log("SW Register failed", err));
        }

    } catch (error) {
        console.error("Critical Initialization error:", error);
    }
};

window.onload = init;
