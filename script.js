let globalEvents = [];
let userCountdowns = JSON.parse(localStorage.getItem('cc_custom_data')) || [];

// 1. Improved API Fetch with State Handling
async function fetchHolidays() {
    try {
        const response = await fetch('https://allorigins.win' + encodeURIComponent('https://nager.at'));
        const contents = await response.json();
        const data = JSON.parse(contents.contents);

        globalEvents = data.map(e => ({
            // If it's not a national holiday, add the state codes (e.g. AU-VIC) to the name
            label: e.global ? e.name : `${e.name} (${e.counties.map(c => c.split('-')[1]).join(', ')})`,
            date: e.date + "T00:00:00",
            states: e.counties // Keep track of which states this belongs to
        }));
        
        refreshDisplay();
    } catch (err) {
        console.log("Using backup event list.");
    }
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
    document.getElementById('hero-timer').innerText = getTimeRemaining("2027-01-01T00:00:00");

    // Filter out past events and sort by date
    const upcoming = globalEvents
        .filter(e => Date.parse(e.date) > Date.now())
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    const globalContainer = document.getElementById('major-grid');
    globalContainer.innerHTML = upcoming.map(item => `
        <div class="timer-card">
            <h3>${item.label}</h3>
            <div class="time-display">${getTimeRemaining(item.date)}</div>
        </div>
    `).join('');

    const customContainer = document.getElementById('custom-grid');
    userCountdowns.sort((a, b) => new Date(a.time) - new Date(b.time));
    customContainer.innerHTML = userCountdowns.map((item, index) => `
        <div class="list-item">
            <span class="list-item-title">${item.title}</span>
            <span class="list-item-timer">${getTimeRemaining(item.time)}</span>
            <button onclick="removeEntry(${index})" style="background:transparent; color:#ff4d4d; border:1px solid #ff4d4d; cursor:pointer; padding:2px 8px; border-radius:4px; font-size:10px;">Remove</button>
        </div>
    `).join('');
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

fetchHolidays();
setInterval(refreshDisplay, 1000);
