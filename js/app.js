import * as db from './db.js';
import * as ui from './ui.js';
import * as csv from './csv.js';

const FALLBACK_CATEGORIES = [
    'Food & Dining', 'Transport', 'Rent', 'Bills & Utilities', 
    'Groceries', 'Shopping', 'Health', 'Insurance', 
    'Entertainment', 'Travel', 'Education', 'Investment', 'Others'
];

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

        // 3. Register Service Worker (optional for core logic)
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js').catch(err => console.log("SW Register failed", err));
        }

        const refreshData = async () => {
            const expenses = await db.getAllExpenses();
            ui.renderExpenses(expenses, handleDelete);
            ui.updateSummary(expenses);
        };

        const handleDelete = async (id) => {
            if (confirm("Are you sure you want to delete this expense?")) {
                await db.deleteExpense(id);
                await refreshData();
            }
        };

        // Form Submission
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
                    description: descInput.value
                };

                await db.addExpense(expense);
                form.reset();
                dateInput.valueAsDate = new Date();
                await refreshData();
            };
        }

        // Export/Import
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.onclick = async () => {
                const expenses = await db.getAllExpenses();
                csv.exportToCSV(expenses);
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
                            await db.addExpense(expense);
                        }
                        await refreshData();
                        alert(`Successfully imported ${expenses.length} expenses.`);
                    } catch (error) {
                        alert("Failed to import CSV.");
                    }
                    e.target.value = '';
                }
            };
        }

        // Reset Database Button (Emergency)
        const resetBtn = document.getElementById('reset-db-btn');
        if (resetBtn) {
            resetBtn.onclick = async () => {
                if (confirm("This will delete ALL your saved expenses. Are you sure?")) {
                    await db.clearDatabase();
                    window.location.reload();
                }
            };
        }

        // Initial load
        const dateInput = document.getElementById('date');
        if (dateInput) dateInput.valueAsDate = new Date();
        await refreshData();

    } catch (error) {
        console.error("Critical Initialization error:", error);
    }
};

window.onload = init;
