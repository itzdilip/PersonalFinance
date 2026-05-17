export const renderExpenses = (expenses, onDelete) => {
    const tbody = document.getElementById('expense-tbody');
    tbody.innerHTML = '';

    expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

    expenses.forEach(expense => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${expense.date}</td>
            <td>₹${expense.amount.toFixed(2)}</td>
            <td>${expense.category}</td>
            <td>${expense.description || '-'}</td>
            <td><button class="btn-delete" data-id="${expense.id}">Delete</button></td>
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

    document.getElementById('monthly-total').textContent = `₹${monthlyTotal.toFixed(2)}`;
    document.getElementById('all-time-total').textContent = `₹${total.toFixed(2)}`;
};

export const populateCategories = (categories) => {
    const select = document.getElementById('category');
    select.innerHTML = '';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.name;
        option.textContent = cat.name;
        select.appendChild(option);
    });
};
