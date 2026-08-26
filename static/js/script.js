// ================================================================
// 🐍 MK CYBER HUB - Complete JavaScript v8.1
// ================================================================

// ===== GLOBALS =====
let model = null;
let stream = null;
let running = false;
let interval = null;
let threatMap = null;
let scanCount = 0;
let captureCount = 0;
let galleryImages = [];
let visionMode = 'object';
let trackedObjects = {};

// ================================================================
// 🌙 THEME
// ================================================================

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const btn = document.querySelector('.theme-btn');
    btn.textContent = document.body.classList.contains('light-mode') ? '☀️' : '🌙';
    localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
    if (threatMap) setTimeout(() => threatMap.invalidateSize(), 300);
}

if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
    document.querySelector('.theme-btn').textContent = '☀️';
}

// ================================================================
// ⏰ CLOCK
// ================================================================

function updateClock() {
    const now = new Date();
    document.getElementById('currentTime').textContent =
        String(now.getHours()).padStart(2, '0') + ':' +
        String(now.getMinutes()).padStart(2, '0') + ':' +
        String(now.getSeconds()).padStart(2, '0');
}
updateClock();
setInterval(updateClock, 1000);

// ================================================================
// 📊 FETCH STATS
// ================================================================

async function fetchStats() {
    try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        document.getElementById('totalThreats').textContent = data.threats?.toLocaleString() || '0';
        document.getElementById('activeAttacks').textContent = data.attacks?.toLocaleString() || '0';
        document.getElementById('vulnerabilities').textContent = data.vulnerabilities?.toLocaleString() || '0';
        document.getElementById('countries').textContent = data.countries?.toLocaleString() || '0';
    } catch (e) {}
}

async function fetchCountryStats() {
    try {
        const res = await fetch('/api/country-stats');
        const data = await res.json();
        document.getElementById('usThreats').textContent = data.us?.toLocaleString() || '0';
        document.getElementById('inThreats').textContent = data.in?.toLocaleString() || '0';
        document.getElementById('ruThreats').textContent = data.ru?.toLocaleString() || '0';
        document.getElementById('cnThreats').textContent = data.cn?.toLocaleString() || '0';
        document.getElementById('ukThreats').textContent = data.uk?.toLocaleString() || '0';
        document.getElementById('deThreats').textContent = data.de?.toLocaleString() || '0';
    } catch (e) {}
}

async function fetchNews() {
    try {
        const res = await fetch('/api/news');
        const data = await res.json();
        document.getElementById('newsTicker').innerHTML = `<span>🚨 ${data.news}</span>`;
    } catch (e) {}
}

setInterval(fetchStats, 15000);
setInterval(fetchCountryStats, 15000);
setInterval(fetchNews, 30000);
fetchStats();
fetchCountryStats();
fetchNews();

// ================================================================
// 🗺️ THREAT MAP
// ================================================================

async function initThreatMap() {
    try {
        const container = document.getElementById('threatMap');
        if (!container) return;

        const res = await fetch('/api/map-data');
        const locations = await res.json();

        threatMap = L.map('threatMap', { center: [20, 0], zoom: 2, zoomControl: true });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(threatMap);

        locations.forEach(loc => {
            const color = loc.severity === 'high' ? '#FF4444' : loc.severity === 'medium' ? '#FFAA00' : '#44DD88';
            const icon = L.divIcon({
                html: `<div style="background:${color};width:12px;height:12px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 15px ${color};"></div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8]
            });
            const marker = L.marker([loc.lat, loc.lng], { icon: icon }).addTo(threatMap);
            marker.bindPopup(`<b>${loc.country}</b><br>${loc.city}<br>⚡ ${loc.threat}`);
        });

        const group = L.featureGroup(threatMap._layers);
        threatMap.fitBounds(group.getBounds().pad(0.1));
    } catch (e) { console.log('Map error:', e); }
}

setTimeout(initThreatMap, 800);

// ================================================================
// 🎯 OBJECT DATABASE
// ================================================================

const OBJECT_DATABASE = {
    'person': { name: 'Person', icon: '👤', category: 'Human', description: 'A human being - most intelligent species!' },
    'dog': { name: 'Dog', icon: '🐕', category: 'Animal', description: 'Loyal domesticated carnivore!' },
    'cat': { name: 'Cat', icon: '🐈', category: 'Animal', description: 'Small carnivorous pet!' },
    'car': { name: 'Car', icon: '🚗', category: 'Vehicle', description: 'Four-wheeled motor vehicle!' },
    'laptop': { name: 'Laptop', icon: '💻', category: 'Electronics', description: 'Portable computer!' },
    'cell phone': { name: 'Phone', icon: '📱', category: 'Electronics', description: 'Communication device!' },
    'chair': { name: 'Chair', icon: '🪑', category: 'Furniture', description: 'Seat with backrest!' },
    'book': { name: 'Book', icon: '📚', category: 'Media', description: 'Collection of written pages!' },
    'bottle': { name: 'Bottle', icon: '🍾', category: 'Container', description: 'Container for liquids!' },
    'pizza': { name: 'Pizza', icon: '🍕', category: 'Food', description: 'Flat bread with toppings!' }
};

function getObjectInfo(name) {
    if (!name) return { name: 'Unknown', icon: '❓', category: 'Unknown', description: 'Object detected' };
    const lower = name.toLowerCase();
    if (OBJECT_DATABASE[lower]) return OBJECT_DATABASE[lower];
    for (const [key, val] of Object.entries(OBJECT_DATABASE)) {
        if (lower.includes(key) || key.includes(lower)) return val;
    }
    return { name: name, icon: '❓', category: 'Object', description: 'A ' + name + ' detected' };
}

function getCategory(className) {
    const person = ['person'];
    const devices = ['laptop', 'cell phone', 'tv', 'mouse', 'keyboard', 'remote'];
    const vehicles = ['car', 'motorcycle', 'bus', 'truck', 'train'];
    if (person.includes(className)) return 'person';
    if (devices.includes(className)) return 'device';
    if (vehicles.includes(className)) return 'vehicle';
    return 'other';
}

// ================================================================
// 🎯 SET VISION MODE
// ================================================================

function setVisionMode(mode) {
    visionMode = mode;
    document.querySelectorAll('.vision-modes .mode').forEach(b => b.classList.remove('active'));
    const map = { 'object': 'modeObject', 'tracking': 'modeTracking', 'counter': 'modeCounter', 'all': 'modeAll' };
    if (map[mode]) document.getElementById(map[mode]).classList.add('active');
    const modeNames = { 'object': '🎯 Object Detection', 'tracking': '🎯 Tracking Mode', 'counter': '📊 Counter Mode', 'all': '🧠 All Features' };
    document.getElementById('detectedObject').textContent = modeNames[mode] || 'Detecting...';
}

// ================================================================
// 🎯 AI VISION - TENSORFLOW
// ================================================================

async function loadModel() {
    try {
        if (typeof cocoSsd !== 'undefined') {
            model = await cocoSsd.load();
            console.log('✅ COCO-SSD Loaded');
            return true;
        }
        return false;
    } catch (e) { console.log('Model load error:', e); return false; }
}

async function startScanner() {
    const video = document.getElementById('video');
    const status = document.getElementById('cameraStatus');

    try {
        if (!model) {
            status.innerHTML = '⏳ LOADING...';
            await loadModel();
            if (!model) { status.innerHTML = '❌ FAILED'; return; }
        }
        if (stream) { stream.getTracks().forEach(t => t.stop());
            stream = null; }
        status.innerHTML = '📷 CAMERA...';
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 480 }, height: { ideal: 360 } },
            audio: false
        });
        video.srcObject = stream;
        await video.play();
        running = true;
        status.innerHTML = '<span class="dot"></span> LIVE';
        document.getElementById('visionStatus').textContent = '🟢 LIVE';
        startDetectionLoop();
    } catch (e) {
        status.innerHTML = '❌ ' + e.message;
        console.log('Camera error:', e);
    }
}

function startDetectionLoop() {
    if (interval) clearInterval(interval);
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    let frames = 0,
        lastFps = Date.now();
    let peopleCount = 0,
        deviceCount = 0,
        vehicleCount = 0,
        totalCount = 0;

    interval = setInterval(async () => {
        if (!running || !video || video.paused) return;
        if (video.videoWidth === 0) return;

        const w = video.videoWidth,
            h = video.videoHeight;
        canvas.width = w;
        canvas.height = h;
        ctx.clearRect(0, 0, w, h);

        frames++;
        if (Date.now() - lastFps > 1000) {
            document.getElementById('fps').textContent = frames;
            document.getElementById('fpsDisplay').textContent = 'FPS: ' + frames;
            frames = 0;
            lastFps = Date.now();
        }

        if (model) {
            try {
                const predictions = await model.detect(video);
                const filtered = predictions.filter(p => p.score > 0.45);
                peopleCount = 0;
                deviceCount = 0;
                vehicleCount = 0;

                const colors = { 'person': '#00D4FF', 'car': '#FF6B6B', 'motorcycle': '#FF6B6B', 'bus': '#FF6B6B', 'truck': '#FF6B6B', 'laptop': '#D4A843', 'cell phone': '#D4A843', 'tv': '#D4A843', 'default': '#44DD88' };

                filtered.forEach((p) => {
                    const category = getCategory(p.class);
                    const color = colors[p.class] || colors['default'];
                    if (category === 'person') peopleCount++;
                    else if (category === 'device') deviceCount++;
                    else if (category === 'vehicle') vehicleCount++;

                    ctx.strokeStyle = color;
                    ctx.lineWidth = 2;
                    ctx.strokeRect(p.bbox[0], p.bbox[1], p.bbox[2], p.bbox[3]);

                    const info = getObjectInfo(p.class);
                    const label = info.icon + ' ' + p.class.toUpperCase() + ' (' + Math.round(p.score * 100) + '%)';
                    ctx.font = 'bold 11px Inter, sans-serif';
                    const metrics = ctx.measureText(label);
                    ctx.fillStyle = 'rgba(0,0,0,0.75)';
                    ctx.fillRect(p.bbox[0] - 2, p.bbox[1] - 22, metrics.width + 14, 22);
                    ctx.fillStyle = color;
                    ctx.fillText(label, p.bbox[0] + 4, p.bbox[1] - 5);

                    if (visionMode === 'tracking' || visionMode === 'all') {
                        const id = p.class + '_' + Math.round(p.bbox[0]) + '_' + Math.round(p.bbox[1]);
                        if (!trackedObjects[id]) {
                            trackedObjects[id] = { id: Object.keys(trackedObjects).length, class: p.class, firstSeen: Date.now() };
                        }
                        ctx.fillStyle = 'rgba(255,255,255,0.5)';
                        ctx.font = '9px Inter';
                        ctx.fillText('ID: ' + trackedObjects[id].id, p.bbox[0] + 4, p.bbox[1] + p.bbox[3] + 16);
                    }
                });

                totalCount = filtered.length;
                document.getElementById('objCount').textContent = totalCount;
                document.getElementById('dashTotal').textContent = totalCount;
                document.getElementById('dashPeople').textContent = peopleCount;
                document.getElementById('peopleCount').textContent = peopleCount;
                document.getElementById('deviceCount').textContent = deviceCount;
                document.getElementById('vehicleCount').textContent = vehicleCount;
                document.getElementById('totalCount').textContent = totalCount;

                if (filtered.length > 0) {
                    const top = filtered[0];
                    const info = getObjectInfo(top.class);
                    const confidence = Math.round(top.score * 100);
                    document.getElementById('detectedObject').textContent = info.icon + ' ' + info.name + ' (' + confidence + '%)';
                    document.getElementById('detectedConfidence').textContent = 'Confidence: ' + confidence + '%';
                    document.getElementById('confidence').textContent = confidence + '%';
                    document.getElementById('scanObjectName').textContent = info.name;
                    document.getElementById('scanCategory').textContent = info.category;
                    document.getElementById('scanDescription').textContent = info.description;
                    document.getElementById('scanConfidence').textContent = confidence + '%';
                } else {
                    document.getElementById('detectedObject').textContent = '🔍 No Object';
                    document.getElementById('detectedConfidence').textContent = 'Confidence: --%';
                    document.getElementById('confidence').textContent = '--%';
                }
            } catch (e) { console.log('Detection error:', e); }
        }
    }, 200);
}

function stopScanner() {
    running = false;
    if (interval) clearInterval(interval);
    if (stream) { stream.getTracks().forEach(t => t.stop());
        stream = null; }
    const video = document.getElementById('video');
    if (video) { video.srcObject = null;
        video.pause(); }
    document.getElementById('cameraStatus').innerHTML = '<span class="dot"></span> STOPPED';
    document.getElementById('visionStatus').textContent = '⏸️ PAUSED';
}

function switchCamera() {
    if (running) { stopScanner();
        setTimeout(startScanner, 500); }
}

// ================================================================
// 📸 CAPTURE FUNCTIONS
// ================================================================

function captureFrame() {
    if (!running) { alert('START CAMERA FIRST!'); return; }
    const canvas = document.getElementById('canvas');
    const imgData = canvas.toDataURL('image/jpeg');
    addToGallery(imgData);
    document.getElementById('scanResultImage').src = imgData;
    document.getElementById('scanResults').style.display = 'block';
    document.getElementById('scanStatus').textContent = '✅ Complete';
    document.getElementById('scanTime').textContent = new Date().toLocaleTimeString();
    captureCount++;
    document.getElementById('captureCount').textContent = 'Captures: ' + captureCount;
    document.getElementById('dashScans').textContent = captureCount;
    const obj = document.getElementById('detectedObject').textContent;
    const info = getObjectInfo(obj.split('(')[0].trim());
    document.getElementById('scanObjectName').textContent = info.name;
    document.getElementById('scanCategory').textContent = info.category;
    document.getElementById('scanDescription').textContent = info.description;
}

function captureBurst() {
    if (!running) { alert('START CAMERA FIRST!'); return; }
    const canvas = document.getElementById('canvas');
    let count = 0;
    const maxCount = 5;
    const burstInterval = setInterval(() => {
        if (count >= maxCount) { clearInterval(burstInterval); return; }
        const imgData = canvas.toDataURL('image/jpeg');
        addToGallery(imgData);
        count++;
        captureCount++;
        document.getElementById('captureCount').textContent = 'Captures: ' + captureCount;
        document.getElementById('dashScans').textContent = captureCount;
        const flash = document.createElement('div');
        flash.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#fff;z-index:9999;opacity:0.2;pointer-events:none;transition:opacity 0.1s;';
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 100);
    }, 200);
    setTimeout(() => {
        document.getElementById('scanResultImage').src = canvas.toDataURL('image/jpeg');
        document.getElementById('scanResults').style.display = 'block';
        document.getElementById('scanStatus').textContent = '✅ Burst Complete! (' + maxCount + ' photos)';
        document.getElementById('scanTime').textContent = new Date().toLocaleTimeString();
    }, 1000);
}

// ================================================================
// 🖼️ GALLERY FUNCTIONS
// ================================================================

function addToGallery(imgData) {
    galleryImages.push(imgData);
    renderGallery();
}

function renderGallery() {
    const grid = document.getElementById('galleryGrid');
    grid.innerHTML = galleryImages.map((img, i) =>
        `<img src="${img}" alt="Capture ${i+1}" onclick="viewImage(${i})">`
    ).join('');
}

function viewImage(index) {
    if (galleryImages[index]) {
        document.getElementById('scanResultImage').src = galleryImages[index];
        document.getElementById('scanResults').style.display = 'block';
        document.getElementById('scanStatus').textContent = '📷 Gallery Image ' + (index + 1);
        document.getElementById('scanTime').textContent = 'Gallery View';
    }
}

function clearGallery() {
    if (confirm('Clear all gallery images?')) { galleryImages = [];
        renderGallery(); }
}

// ================================================================
// 📥 DOWNLOAD IMAGE
// ================================================================

function downloadImage() {
    const img = document.getElementById('scanResultImage');
    if (!img.src || img.src === '') { alert('No image to download!'); return; }
    const link = document.createElement('a');
    link.download = 'MK_Scan_' + Date.now() + '.jpg';
    link.href = img.src;
    link.click();
}

// ================================================================
// 🌐 LIVE SEARCH
// ================================================================

function liveGoogleSearch() {
    const obj = document.getElementById('scanObjectName').textContent;
    if (obj && obj !== '-' && obj !== 'Unknown') {
        window.open('https://www.google.com/search?q=' + encodeURIComponent(obj), '_blank');
    } else { alert('SCAN AN OBJECT FIRST!'); }
}

function liveYouTubeSearch() {
    const obj = document.getElementById('scanObjectName').textContent;
    if (obj && obj !== '-' && obj !== 'Unknown') {
        window.open('https://www.youtube.com/results?search_query=' + encodeURIComponent(obj), '_blank');
    } else { alert('SCAN AN OBJECT FIRST!'); }
}

function liveWikipediaPage() {
    const obj = document.getElementById('scanObjectName').textContent;
    if (obj && obj !== '-' && obj !== 'Unknown') {
        window.open('https://en.wikipedia.org/wiki/' + encodeURIComponent(obj), '_blank');
    } else { alert('SCAN AN OBJECT FIRST!'); }
}

// ================================================================
// 🔍 OSINT FUNCTIONS
// ================================================================

async function runOSINT(tool) {
    const endpoints = {
        'dork': { input: 'dorkInput', result: 'dorkResult', url: '/api/osint/dork' },
        'shodan': { input: 'shodanInput', result: 'shodanResult', url: '/api/osint/shodan' },
        'censys': { input: 'censysInput', result: 'censysResult', url: '/api/osint/censys' },
        'hibp': { input: 'hibpInput', result: 'hibpResult', url: '/api/osint/hibp' },
        'virustotal': { input: 'vtInput', result: 'vtResult', url: '/api/osint/virustotal' },
        'whois': { input: 'whoisInput', result: 'whoisResult', url: '/api/osint/whois' },
        'spider': { input: 'spiderInput', result: 'spiderResult', url: '/api/osint/spider' },
        'wayback': { input: 'waybackInput', result: 'waybackResult', url: '/api/osint/wayback' }
    };
    const config = endpoints[tool];
    if (!config) return;
    const input = document.getElementById(config.input);
    const result = document.getElementById(config.result);
    const query = input.value.trim() || 'example';
    result.innerHTML = '🔍 SCANNING...';
    result.className = 'result';
    try {
        const res = await fetch(config.url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: query, email: query, url: query }) });
        const data = await res.json();
        if (data.status === 'success') {
            result.innerHTML = `✅ ${data.message || 'Complete'}`;
            result.className = 'result success';
        } else { result.innerHTML = '❌ Error';
            result.className = 'result error'; }
    } catch (e) { result.innerHTML = '❌ Network error';
        result.className = 'result error'; }
}

// ================================================================
// 🛡️ SECURITY FUNCTIONS
// ================================================================

async function runSecurity(tool) {
    const endpoints = {
        'threat': { input: 'threatInput', result: 'threatResult', url: '/api/security/threat' },
        'darkweb': { input: 'darkWebInput', result: 'darkWebResult', url: '/api/security/darkweb' },
        'ssl': { input: 'sslInput', result: 'sslResult', url: '/api/security/ssl' },
        'phish': { input: 'phishInput', result: 'phishResult', url: '/api/security/phish' },
        'ip': { input: 'ipInput', result: 'ipResult', url: '/api/security/ip' },
        'vuln': { input: 'vulnInput', result: 'vulnResult', url: '/api/security/vuln' }
    };
    const config = endpoints[tool];
    if (!config) return;
    const input = document.getElementById(config.input);
    const result = document.getElementById(config.result);
    const query = input.value.trim() || 'target';
    result.innerHTML = '🛡️ ANALYZING...';
    result.className = 'result';
    try {
        const res = await fetch(config.url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ target: query, domain: query, input: query, ip: query }) });
        const data = await res.json();
        if (data.status === 'success') {
            result.innerHTML = `✅ ${data.message || data.risk || 'Complete'}`;
            result.className = 'result success';
        } else { result.innerHTML = '❌ Error';
            result.className = 'result error'; }
    } catch (e) { result.innerHTML = '❌ Network error';
        result.className = 'result error'; }
}

// ================================================================
// 📊 CHARTS
// ================================================================

setTimeout(() => {
    try {
        new Chart(document.getElementById('threatChart'), {
            type: 'line',
            data: {
                labels: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
                datasets: [{ label: 'THREATS', data: [45, 52, 38, 65, 71, 48, 56], borderColor: '#00D4FF', backgroundColor: 'rgba(0,212,255,0.06)', tension: 0.4, fill: true, pointRadius: 2 }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#8A9AAA', font: { size: 9 } } }, y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#8A9AAA', font: { size: 9 } } } } }
        });
        new Chart(document.getElementById('attackChart'), {
            type: 'doughnut',
            data: {
                labels: ['DDOS', 'PHISHING', 'MALWARE', 'RANSOM', 'OTHER'],
                datasets: [{ data: [30, 25, 20, 15, 10], backgroundColor: ['#00D4FF', '#D4A843', '#44DD88', '#FF4444', '#6A7A8A'], borderWidth: 0 }]
            },
            options: { responsive: true, maintainAspectRatio: false, cutout: '68%', plugins: { legend: { position: 'bottom', labels: { color: '#8A9AAA', font: { size: 9 }, padding: 12, usePointStyle: true } } } }
        });
    } catch (e) {}
}, 600);

// ================================================================
// 📊 EXPORT
// ================================================================

async function exportData(format) {
    try {
        if (format === 'csv') { window.open('/api/export/csv', '_blank'); } else if (format === 'json') { window.open('/api/export/json', '_blank'); }
    } catch (e) { alert('Export error'); }
}

// ================================================================
// 🔄 TIMELINE
// ================================================================

async function updateTimeline() {
    try {
        const res = await fetch('/api/timeline');
        const events = await res.json();
        document.getElementById('timeline').innerHTML = events.map(e =>
            `<div class="timeline-item"><span class="time">${e.time}</span><span class="event">${e.event}</span></div>`
        ).join('');
    } catch (e) {}
}
setInterval(updateTimeline, 5000);
updateTimeline();

// ================================================================
// 🚀 PRELOADER
// ================================================================

window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) setTimeout(() => preloader.classList.add('hidden'), 1000);
});

// ================================================================
// 🚀 INIT
// ================================================================

console.log('%c⚡ MK CYBER HUB v8.1 - ADVANCED', 'font-size:20px;color:#00D4FF;font-weight:900');
console.log('🎯 Features: Multi-Object Detection, Tracking, Counter, Gallery, Burst');
console.log('✅ All Systems Active');

setTimeout(loadModel, 1500);
