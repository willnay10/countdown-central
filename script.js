// 1. Massive Backup List (Ensures you always see cards)
let globalEvents = [
    { label: "Halloween", date: "2026-10-31T00:00:00" },
    { label: "Melbourne Cup", date: "2026-11-03T15:00:00" },
    { label: "Remembrance Day", date: "2026-11-11T11:00:00" },
    { label: "Christmas Day", date: "2026-12-25T00:00:00" },
    { label: "Boxing Day", date: "2026-12-26T00:00:00" },
    { label: "New Year Eve", date: "2026-12-31T23:59:59" },
    { label: "New Year's Day", date: "2027-01-01T00:00:00" },
    { label: "Australia Day", date: "2027-01-26T00:00:00" },
    { label: "Lunar New Year", date: "2027-02-06T00:00:00" },
    { label: "Valentine's Day", date: "2027-02-14T00:00:00" },
    { label: "St Patrick's Day", date: "2027-03-17T00:00:00" },
    { label: "Good Friday", date: "2027-03-26T00:00:00" },
    { label: "Easter Sunday", date: "2027-03-28T00:00:00" },
    { label: "Anzac Day", date: "2027-04-25T05:00:00" },
    { label: "Mother's Day", date: "2027-05-09T00:00:00" },
    { label: "King's Birthday", date: "2027-06-14T00:00:00" },
    { label: "Independence Day (US)", date: "2027-07-04T00:00:00" },
    { label: "Halloween 2027", date: "2027-10-31T00:00:00" },
    { label: "Christmas 2027", date: "2027-12-25T00:00:00" },
    { label: "New Year 2028", date: "2028-01-01T00:00:00" }
];

let userCountdowns = JSON.parse(localStorage.getItem('cc_custom_data')) || [];

// 2. Fetch Live Holidays using YOUR new Proxy
async function fetchHolidays() {
    try {
        const targetUrl = 'https://nager.at';
        // Using your private Cloudflare Worker proxy
        const proxyUrl = 'https://workers.dev'; 
        
        const response = await fetch(`${proxyUrl}/?url=${encodeURIComponent(targetUrl)}`);
        
        if (!response.ok) throw new Error('Proxy unreachable');
        
        const data = await response.json();

        if (Array.isArray(data)) {
            const apiEvents = data.map(e => ({
                label: `${e.name} [${e.countryCode}]`,
                date: e.date + "T00:00:00"
            }));

            // Merge API events with our backup list, removing duplicates
            const combined = [...globalEvents, ...apiEvents];
            globalEvents = Array.from(new Map(combined.map(item => [item['label'], item])).values());
            console.log("Global holidays loaded via private proxy.");
        }
    } catch (err) {
        console.warn("Using backup list. Private proxy unreachable.");
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
    const heroTimer = document.getElementById('hero-timer');
    if (heroTimer) heroTimer.innerText = getTimeRemaining("2027-01-01T00:00:00");

    const globalContainer = document.getElementById('major-grid');
    if (globalContainer) {
        const upcoming = globalEvents
            .filter(e => Date.parse(e.date) > Date.now())
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        globalContainer.innerHTML = upcoming.map((item, index) => `
            <div class="timer-card">
                ${index === 0 ? '<span class="next-badge">WORLDWIDE NEXT</span>' : ''}
                <h3>${item.label}</h3>
                <div class="time-display">${getTimeRemaining(item.date)}</div>
            </div>
        `).join('');
    }

    const customContainer = document.getElementById('custom-grid');
    if (customContainer) {
        userCountdowns.sort((a, b) => new Date(a.time) - new Date(b.time));
        customContainer.innerHTML = userCountdowns.map((item, index) => `
            <div class="list-item">
                <span class="list-item-title">${item.title}</span>
                <span class="list-item-timer">${getTimeRemaining(item.time)}</span>
                <button class="delete-btn" onclick="removeEntry(${index})">Remove</button>
            </div>
        `).join('');
    }
}

function saveEvent() {
    const titleInput = document.getElementById('event-title');
    const timeInput = document.getElementById('event-time');
    if (titleInput.value && timeInput.value) {
        userCountdowns.push({ title: titleInput.value, time: timeInput.value });
        localStorage.setItem('cc_custom_data', JSON.stringify(userCountdowns));
        titleInput.value = '';
        timeInput.value = '';
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
