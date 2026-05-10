// Expanded backup list - 20+ major global and regional events
let globalEvents = [
    { label: "Halloween", date: "2026-10-31T00:00:00" },
    { label: "Melbourne Cup", date: "2026-11-03T15:00:00" },
    { label: "Remembrance Day", date: "2026-11-11T11:00:00" },
    { label: "Christmas Day", date: "2026-12-25T00:00:00" },
    { label: "Boxing Day", date: "2026-12-26T00:00:00" },
    { label: "New Year Eve", date: "2026-12-31T23:59:59" },
    { label: "New Year's Day", date: "2027-01-01T00:00:00" },
    { label: "Australia Day", date: "2027-01-26T00:00:00" },
    { label: "Groundhog Day", date: "2027-02-02T00:00:00" },
    { label: "Lunar New Year", date: "2027-02-06T00:00:00" },
    { label: "Valentine's Day", date: "2027-02-14T00:00:00" },
    { label: "St David's Day", date: "2027-03-01T00:00:00" },
    { label: "International Women's Day", date: "2027-03-08T00:00:00" },
    { label: "St Patrick's Day", date: "2027-03-17T00:00:00" },
    { label: "Good Friday", date: "2027-03-26T00:00:00" },
    { label: "Easter Sunday", date: "2027-03-28T00:00:00" },
    { label: "Easter Monday", date: "2027-03-29T00:00:00" },
    { label: "Earth Day", date: "2027-04-22T00:00:00" },
    { label: "Anzac Day", date: "2027-04-25T05:00:00" },
    { label: "Mother's Day", date: "2027-05-09T00:00:00" },
    { label: "Winter Solstice (AU)", date: "2027-06-21T00:00:00" },
    { label: "Independence Day (US)", date: "2027-07-04T00:00:00" }
];

let userCountdowns = JSON.parse(localStorage.getItem('cc_custom_data')) || [];

async function fetchHolidays() {
    try {
        const targetUrl = 'https://nager.at';
        const response = await fetch(`https://corsproxy.io{encodeURIComponent(targetUrl)}`);
        
        if (!response.ok) throw new Error('Proxy unreachable');
        
        const data = await response.json();

        if (Array.isArray(data)) {
            const apiEvents = data.map(e => ({
                label: `${e.name} [${e.countryCode}]`,
                date: e.date + "T00:00:00"
            }));

            const combined = [...globalEvents, ...apiEvents];
            globalEvents = Array.from(new Map(combined.map(item => [item['label'], item])).values());
        }
    } catch (err) {
        console.warn("Using expanded backup list. External API unreachable.");
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
                ${index === 0 ? '<span class="next-badge">NEXT</span>' : ''}
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
                <button onclick="removeEntry(${index})" style="background:transparent; color:#ff4d4d; border:1px solid #ff4d4d; cursor:pointer; padding:2px 8px; border-radius:4px; font-size:10px;">Remove</button>
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

fetchHolidays();
setInterval(refreshDisplay, 1000);
refreshDisplay();
