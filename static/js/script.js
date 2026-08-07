// ================================================================
// 🐍 MK CYBER HUB - Frontend JavaScript
// ================================================================

// ===== THEME =====
function toggleTheme() {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
}

// Load saved theme
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
}

// ===== CLOCK =====
function updateClock() {
    const now = new Date();
    document.getElementById('currentTime').textContent = 
        String(now.getHours()).padStart(2, '0') + ':' +
        String(now.getMinutes()).padStart(2, '0') + ':' +
        String(now.getSeconds()).padStart(2, '0');
}
updateClock();
setInterval(updateClock, 1000);

// ===== FETCH STATS =====
async function fetchStats() {
    try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        document.getElementById('totalThreats').textContent = data.threats.toLocaleString();
        document.getElementById('activeAttacks').textContent = data.attacks.toLocaleString();
        document.getElementById('vulnerabilities').textContent = data.vulnerabilities.toLocaleString();
        document.getElementById('countries').textContent = data.countries.toLocaleString();
    } catch (e) {
        console.log('Stats error:', e);
    }
}
fetchStats();
setInterval(fetchStats, 10000);

// ===== FETCH NEWS =====
async function fetchNews() {
    try {
        const response = await fetch('/api/news');
        const data = await response.json();
        document.getElementById('newsTicker').innerHTML = `🚨 ${data.news}`;
    } catch (e) {
        console.log('News error:', e);
    }
}
fetchNews();
setInterval(fetchNews, 30000);

// ================================================================
console.log('✅ MK CYBER HUB - Frontend Loaded');
