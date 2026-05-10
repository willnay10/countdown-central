// High-priority backup list to ensure cards always show up immediately
let globalEvents = [
    { label: "Halloween", date: "2026-10-31T00:00:00" },
    { label: "Christmas Day", date: "2026-12-25T00:00:00" },
    { label: "Boxing Day", date: "2026-12-26T00:00:00" },
    { label: "New Year Eve", date: "2026-12-31T23:59:59" },
    { label: "New Year's Day", date: "2027-01-01T00:00:00" },
    { label: "Australia Day", date: "2027-01-26T00:00:00" }
];

let userCountdowns = JSON.parse(localStorage.getItem('cc_custom_data')) || [];

// Fetch live holidays with improved error handling
async function fetchHolidays() {
    try {
        const apiUrl = 'https://nager.at';
        // Using a more reliable proxy method
        const response = await fetch(`https://allorigins.win{encodeURIComponent(apiUrl)}`);
        
        if (!response.ok) throw new Error('Proxy failed');
        
        const resData = await response.json();
        const data = JSON.parse(resData.contents);

        if (Array.isArray(data)) {
            const apiEvents = data.map(e => ({
                label: e.global ? e.name : `${e.name} (${e.counties ? e.counties.map(c => c.split('-')[1]).join(', ') : 'Regional'})`,
                date: e.date + "T00:00:00"
            }));

            // Merge and remove duplicates
            const combined = [...globalEvents, ...apiEvents];
            globalEvents = Array.from(new Map(combined.map(item => [item['label'], item])).values());
            console.log("Live events loaded successfully.");
        }
    } catch (err) {
        console.warn("Using backup list. Live API was unreachable.");
    }
    refreshDisplay();
}

function getTimeRemaining(target) {
    const total = Date.parse(target) - Date.now();
    if (total <= 0) return "00d 00h 00m 00s";

    const s = Math.floor((total / 1000) % 60);
    const m = Math.floor((total / (1000 * 60)) % 60);
    const h = Math.floor((total / (1000 * 60 * 60)) % 24);
    const d = Math.floor(total / (1000 * 60 * 60 * 24));

    const pad = (num) => num.toString().padStart(2, '0');
    return `${pad(d)}d ${pad(h)}h ${pad(m)}m ${pad(s)}s`;
}

function refreshDisplay() {
    // 1. Hero Timer
    const heroTimerElement = document.getElementById('hero-timer');
    if (heroTimerElement) {
        heroTimerElement.innerText = getTimeRemaining("2027-01-01T00:00:00");
    }

    // 2. Global Events (Upcoming)
    const globalContainer = document.getElementById('major-grid');
    if (globalContainer) {
        const upcoming = globalEvents
            .filter(e => Date.parse(e.date) > Date.now())
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        globalContainer.innerHTML = upcoming.map((item, index) => `
            <div class="timer-card">
                ${index === 0 ? '<span class="next-badge">NEXT</span>' : ''}
                <h3>${item.label}</h3>
                <div class="time-display">${getTimeRemaining(item.date)}</div>
            </div>
        `).join('');
    }

    // 3. User Personal Countdowns
    const customContainer = document.getElementById('custom-grid');
    if (customContainer) {
        userCountdowns.sort((a, b) => new Date(a.time) - new Date(b.time));
        customContainer.innerHTML = userCountdowns.map((item, index) => `
            <div class="list-item">
                <span class="list-item-title">${item.title}</span>
                <span class="list-item-timer">${getTimeRemaining(item.time)}</span>
                <button class="delete-btn" onclick="removeEntry(${index})">Delete</button>
            </div>
        `).join('');
    }
}

function saveEvent() {
    const title = document.getElementById('event-title').value;
    const time = document.getElementById('event-time').value;
    if (title && time) {
        userCountdowns.push({ title, time });
        localStorage.setItem('cc_custom_data', JSON.stringify(userCountdowns));
        document.getElementById('event-title').value = '';
        document.getElementById('event-time').value = '';
        refreshDisplay();
    }
}

function removeEntry(idx) {
    userCountdowns.splice(idx, 1);
    localStorage.setItem('cc_custom_data', JSON.stringify(userCountdowns));
    refreshDisplay();
}

// Start everything
fetchHolidays();
setInterval(refreshDisplay, 1000);
refreshDisplay();
