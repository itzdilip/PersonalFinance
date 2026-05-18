const DB_NAME = 'ExpenseTrackerDB';
const DB_VERSION = 3; // Bumped version to force upgrade and fix categories issue

export const openDB = () => {
    return new Promise((resolve, reject) => {
        console.log(`Opening database: ${DB_NAME} (v${DB_VERSION})`);
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            console.log("Upgrade needed. Old version:", event.oldVersion);
            
            if (!db.objectStoreNames.contains('expenses')) {
                console.log("Creating expenses store...");
                db.createObjectStore('expenses', { keyPath: 'id', autoIncrement: true });
            }
            
            if (!db.objectStoreNames.contains('categories')) {
                console.log("Creating categories store...");
                const categoryStore = db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
                categoryStore.createIndex('name', 'name', { unique: true });
            }
        };


        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => {
            console.error("Database open error:", e.target.error);
            reject(request.error);
        };
    });
};

export const initDB = async () => {
    console.log("Initializing database...");
    const db = await openDB();
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['categories'], 'readwrite');
        const store = transaction.objectStore('categories');
        const countRequest = store.count();

        countRequest.onsuccess = () => {
            if (countRequest.result === 0) {
                console.log("Categories empty. Populating defaults...");
                const indianCategories = [
                    'Food & Dining', 'Transport', 'Rent', 'Bills & Utilities', 
                    'Groceries', 'Shopping', 'Health', 'Insurance', 
                    'Entertainment', 'Travel', 'Education', 'Investment', 'Others'
                ];
                
                indianCategories.forEach(name => store.add({ name }));
                
                transaction.oncomplete = () => {
                    console.log("Default categories populated.");
                    resolve();
                };
            } else {
                console.log(`Found ${countRequest.result} existing categories.`);
                resolve();
            }
        };
        
        transaction.onerror = (e) => reject(e.target.error);
    });
};

export const clearDatabase = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase(DB_NAME);
        request.onsuccess = () => {
            console.log("Database deleted successfully");
            resolve();
        };
        request.onerror = () => reject(request.error);
        request.onblocked = () => {
            console.warn("Delete blocked. Please close other tabs.");
            alert("Please close other tabs of this app to reset the database.");
        };
    });
};

export const addExpense = async (expense) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['expenses'], 'readwrite');
        const store = transaction.objectStore('expenses');
        const request = store.add({ ...expense, createdAt: new Date().toISOString() });

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const getAllExpenses = async () => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['expenses'], 'readonly');
        const store = transaction.objectStore('expenses');
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const deleteExpense = async (id) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['expenses'], 'readwrite');
        const store = transaction.objectStore('expenses');
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

export const getCategories = async () => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['categories'], 'readonly');
        const store = transaction.objectStore('categories');
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};
