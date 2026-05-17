export const exportToCSV = (expenses) => {
    if (!expenses || expenses.length === 0) {
        alert("No data to export.");
        return;
    }

    const headers = ['Date', 'Amount', 'Category', 'Description'];
    const rows = expenses.map(e => [
        e.date,
        e.amount,
        e.category,
        `"${e.description || ''}"`
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `expenses_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            const lines = text.split("\n");
            const result = [];
            
            // Skip header
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                
                const [date, amount, category, description] = line.split(",").map(item => item.trim().replace(/^"|"$/g, ''));
                
                if (date && amount && category) {
                    result.push({
                        date,
                        amount: parseFloat(amount),
                        category,
                        description: description || ''
                    });
                }
            }
            resolve(result);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
};
