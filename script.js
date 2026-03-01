const form = document.getElementById('resolutionForm');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const entry = {
        issue: document.getElementById('issue').value,
        steps: document.getElementById('steps').value,
        futurePlan: document.getElementById('futurePlan').value,
        date: new Date().toLocaleDateString()
    };

    // Send data to the server
    await fetch('/api/resolutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
    });

    form.reset();
    loadEntries();
});

async function loadEntries() {
    const response = await fetch('/api/resolutions');
    const history = await response.json();
    const list = document.getElementById('entriesList');
    
    list.innerHTML = '<h2>Our Journey</h2>';
    history.reverse().forEach(entry => {
        const card = document.createElement('div');
        card.className = 'resolution-card';
        card.innerHTML = `
            <small>${entry.date}</small>
            <h3>Issue: ${entry.issue}</h3>
            <p><strong>Steps:</strong> ${entry.steps}</p>
            <p><strong>Plan:</strong> ${entry.futurePlan}</p>
        `;
        list.appendChild(card);
    });
}

loadEntries();
