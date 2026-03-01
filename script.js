const SECRET_PIN = "1221"; // Set your secret code here!

function checkPin() {
    const input = document.getElementById('pinInput').value;
    const error = document.getElementById('pinError');
    const overlay = document.getElementById('pinOverlay');

    if (input === SECRET_PIN) {
        overlay.style.display = 'none'; // Hide the gatekeeper
        loadEntries(); // Now load the data
    } else {
        error.style.display = 'block';
        document.getElementById('pinInput').value = '';
    }
    loadEntries();
}

// Make sure loadEntries() doesn't run automatically on page load anymore
// window.onload = loadEntries; <-- Remove or comment this out if it exists

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
    
    // We use a regular for loop or forEach with index to track which one to delete
    history.forEach((entry, index) => {
        const card = document.createElement('div');
        card.className = 'resolution-card';
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between;">
                <small>${entry.date}</small>
                <button onclick="deleteEntry(${index})" class="delete-btn">×</button>
            </div>
            <h3>Issue: ${entry.issue}</h3>
            <p><strong>Steps:</strong> ${entry.steps}</p>
            <p><strong>Plan:</strong> ${entry.futurePlan}</p>
        `;
        // We prepend so the newest stays at the top, but the index stays correct
        list.insertBefore(card, list.firstChild.nextSibling); 
        
        // Inside history.forEach((entry, index) => { ...
const responseButton = entry.steps === "" 
    ? `<button onclick="openResponseBox(${index})" style="background:#3498db;">Add Resolution</button>` 
    : `<p><strong>Steps:</strong> ${entry.steps}</p><p><strong>Plan:</strong> ${entry.futurePlan}</p>`;

card.innerHTML = `
    <div style="display: flex; justify-content: space-between;">
        <small>${entry.date} - <em>${entry.status}</em></small>
        <button onclick="deleteEntry(${index})" class="delete-btn">×</button>
    </div>
    <h3>Issue: ${entry.issue}</h3>
    ${responseButton}
`;
    });
}

async function deleteEntry(index) {
    if (confirm("Are you sure you want to remove this resolution?")) {
        await fetch(`/api/resolutions/${index}`, {
            method: 'DELETE'
        });
        loadEntries(); // Refresh the list
    }
}

function filterEntries() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const cards = document.getElementsByClassName('resolution-card');

    // Loop through every card in the list
    Array.from(cards).forEach(card => {
        const text = card.innerText.toLowerCase();
        
        // If the search term is found in the card's text, show it; otherwise, hide it
        if (text.includes(searchTerm)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}

// 1. Wife submits just the issue
document.getElementById('issueForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const entry = {
        issue: document.getElementById('issue').value,
        steps: "", // Empty for now
        futurePlan: "", // Empty for now
        date: new Date().toLocaleDateString(),
        status: "Pending Response"
    };

    await fetch('/api/resolutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
    });

    document.getElementById('issueForm').reset();
    loadEntries();
});

// 2. Function to open the response box
function openResponseBox(index) {
    document.getElementById('editingIndex').value = index;
    document.getElementById('responseModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('responseModal').style.display = 'none';
}

// 3. Husband saves the response
async function saveResponse() {
    const index = document.getElementById('editingIndex').value;
    const steps = document.getElementById('modalSteps').value;
    const future = document.getElementById('modalFuture').value;

    // Get all current data first
    const res = await fetch('/api/resolutions');
    const history = await res.json();

    // Update the specific entry
    history[index].steps = steps;
    history[index].futurePlan = future;
    history[index].status = "Resolved";

    // Save the whole list back to the server (We'll need a PUT route in server.js)
    await fetch('/api/resolutions/update-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(history)
    });

    closeModal();
    loadEntries();
}


