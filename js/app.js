import * as db from './db.js';
import * as ui from './ui.js';
import * as csv from './csv.js';

const FALLBACK_CATEGORIES = [
    'Food & Dining', 'Transport', 'Rent', 'Bills & Utilities', 
    'Groceries', 'Shopping', 'Health', 'Insurance', 
    'Entertainment', 'Travel', 'Education', 'Investment', 'Others'
];

// Helper to decode JWT without a library
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
    try {
        console.log("Starting App Initialization...");
        
        // 1. Try to init DB
        try {
            await db.initDB();
        } catch (e) {
            console.warn("DB Initialization failed, using fallbacks:", e);
        }

        // 2. Load Categories
        let categories = [];
        try {
            categories = await db.getCategories();
        } catch (e) {
            console.error("Failed to fetch categories from DB:", e);
        }

        if (categories.length === 0) {
            console.log("No categories in DB, using hardcoded fallbacks.");
            categories = FALLBACK_CATEGORIES.map(name => ({ name }));
        }
        
        ui.populateCategories(categories);

        // 3. User & Session Management
        const loadUser = () => {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                return JSON.parse(savedUser);
            }
            return { name: 'Guest', isGoogle: false };
        };

        let currentUser = loadUser();
        ui.updateUserInfo(currentUser);

        // Google Sign-In Listener
        window.addEventListener('google-signed-in', (e) => {
            const credential = e.detail;
            const userData = decodeJwt(credential);
            if (userData) {
                currentUser = { ...userData, isGoogle: true };
                localStorage.setItem('user', JSON.stringify(currentUser));
                ui.updateUserInfo(currentUser);
            }
        });

        // Local Name Edit
        const editNameBtn = document.getElementById('edit-name-btn');
        if (editNameBtn) {
            editNameBtn.onclick = () => {
                const newName = prompt("Enter your name:", currentUser.name);
                if (newName && newName.trim()) {
                    currentUser = { name: newName.trim(), isGoogle: false };
                    localStorage.setItem('user', JSON.stringify(currentUser));
                    ui.updateUserInfo(currentUser);
                }
            };
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

        // 4. Core Logic
        const refreshData = async () => {
            const expenses = await db.getAllExpenses();
            ui.renderExpenses(expenses, handleDelete);
            ui.updateSummary(expenses);
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

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js').catch(err => console.log("SW Register failed", err));
        }

    } catch (error) {
        console.error("Critical Initialization error:", error);
    }
};

window.onload = init;
