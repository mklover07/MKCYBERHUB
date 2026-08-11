// ================================================================
// 🐍 MK CYBER HUB - Optimized JavaScript
// ================================================================

// ===== GLOBALS =====
let model = null;
let stream = null;
let running = false;
let interval = null;
let threatMap = null;
let scanCount = 0;

// ================================================================
// 🌙 THEME
// ================================================================

function toggleTheme() {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    const icon = document.querySelector('.theme-btn');
    icon.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
    if (threatMap) {
        setTimeout(() => threatMap.invalidateSize(), 300);
    }
}

if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
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
        const response = await fetch('/api/stats');
        const data = await response.json();
        document.getElementById('totalThreats').textContent = data.threats?.toLocaleString() || '0';
        document.getElementById('activeAttacks').textContent = data.attacks?.toLocaleString() || '0';
        document.getElementById('vulnerabilities').textContent = data.vulnerabilities?.toLocaleString() || '0';
        document.getElementById('countries').textContent = data.countries?.toLocaleString() || '0';
    } catch (e) { console.log('Stats error'); }
}

async function fetchCountryStats() {
    try {
        const response = await fetch('/api/country-stats');
        const data = await response.json();
        document.getElementById('usThreats').textContent = data.us?.toLocaleString() || '0';
        document.getElementById('inThreats').textContent = data.in?.toLocaleString() || '0';
        document.getElementById('ruThreats').textContent = data.ru?.toLocaleString() || '0';
        document.getElementById('cnThreats').textContent = data.cn?.toLocaleString() || '0';
    } catch (e) { console.log('Country stats error'); }
}

async function fetchNews() {
    try {
        const response = await fetch('/api/news');
        const data = await response.json();
        document.getElementById('newsTicker').innerHTML = `<span>🚨 ${data.news}</span>`;
    } catch (e) { console.log('News error'); }
}

// Update every 15 seconds (less frequent)
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

        const response = await fetch('/api/map-data');
        const locations = await response.json();

        threatMap = L.map('threatMap', {
            center: [20, 0],
            zoom: 2,
            zoomControl: true
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(threatMap);

        locations.forEach(loc => {
            const color = loc.severity === 'high' ? '#FF4444' : 
                         loc.severity === 'medium' ? '#FFAA00' : '#44DD88';
            
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

    } catch (e) {
        console.log('Map error:', e);
    }
}

setTimeout(initThreatMap, 800);

// ================================================================
// 🎯 AI VISION - Optimized
// ================================================================

async function loadModel() {
    try {
        if (typeof cocoSsd !== 'undefined') {
            model = await cocoSsd.load();
            console.log('✅ COCO-SSD Loaded');
            return true;
        }
        return false;
    } catch (e) {
        console.log('Model load error:', e);
        return false;
    }
}

async function startScanner() {
    const video = document.getElementById('video');
    const status = document.getElementById('cameraStatus');

    try {
        if (!model) {
            status.innerHTML = '⏳ LOADING...';
            await loadModel();
            if (!model) {
                status.innerHTML = '❌ FAILED';
                return;
            }
        }

        if (stream) {
            stream.getTracks().forEach(t => t.stop());
            stream = null;
        }

        status.innerHTML = '📷 CAMERA...';
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 480 }, height: { ideal: 360 } },
            audio: false
        });

        video.srcObject = stream;
        await video.play();

        running = true;
        status.innerHTML = '<span class="dot"></span> LIVE';
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

    let frames = 0;
    let lastFps = Date.now();

    // Slower interval = Less CPU usage
    interval = setInterval(async () => {
        if (!running || !video || video.paused) return;
        if (video.videoWidth === 0) return;

        const w = video.videoWidth;
        const h = video.videoHeight;
        canvas.width = w;
        canvas.height = h;
        ctx.clearRect(0, 0, w, h);

        frames++;
        if (Date.now() - lastFps > 1000) {
            document.getElementById('fps').textContent = frames;
            frames = 0;
            lastFps = Date.now();
        }

        if (model) {
            try {
                const predictions = await model.detect(video);
                const filtered = predictions.filter(p => p.score > 0.5);
                
                document.getElementById('objCount').textContent = filtered.length;

                if (filtered.length > 0) {
                    filtered.forEach(p => {
                        ctx.strokeStyle = '#00D4FF';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(p.bbox[0], p.bbox[1], p.bbox[2], p.bbox[3]);

                        const label = p.class.toUpperCase() + ' (' + Math.round(p.score * 100) + '%)';
                        ctx.font = '11px Inter, sans-serif';
                        const metrics = ctx.measureText(label);
                        ctx.fillStyle = 'rgba(0,0,0,0.7)';
                        ctx.fillRect(p.bbox[0] - 2, p.bbox[1] - 20, metrics.width + 12, 20);
                        ctx.fillStyle = '#00D4FF';
                        ctx.fillText(label, p.bbox[0] + 4, p.bbox[1] - 4);
                    });

                    const top = filtered[0];
                    const confidence = Math.round(top.score * 100);
                    document.getElementById('detectedObject').textContent = '🔍 ' + top.class.toUpperCase();
                    document.getElementById('detectedConfidence').textContent = 'CONFIDENCE: ' + confidence + '%';
                    document.getElementById('confidence').textContent = confidence + '%';

                } else {
                    document.getElementById('detectedObject').textContent = '🔍 NO OBJECT';
                    document.getElementById('detectedConfidence').textContent = 'CONFIDENCE: --%';
                }

            } catch (e) {
                console.log('Detection error:', e);
            }
        }

    }, 200); // Slower = Better performance
}

function stopScanner() {
    running = false;
    if (interval) clearInterval(interval);
    if (stream) {
        stream.getTracks().forEach(t => t.stop());
        stream = null;
    }
    const video = document.getElementById('video');
    if (video) {
        video.srcObject = null;
        video.pause();
    }
    document.getElementById('cameraStatus').innerHTML = '<span class="dot"></span> STOPPED';
}

function switchCamera() {
    if (running) {
        stopScanner();
        setTimeout(startScanner, 500);
    }
}

function captureFrame() {
    if (!running) {
        alert('START CAMERA FIRST!');
        return;
    }
    
    const canvas = document.getElementById('canvas');
    const imgData = canvas.toDataURL('image/jpeg');
    document.getElementById('scanResultImage').src = imgData;
    document.getElementById('scanResults').style.display = 'block';
    scanCount++;

    const obj = document.getElementById('detectedObject').textContent.replace('🔍 ', '');
    document.getElementById('scanObjectName').textContent = obj || 'Unknown';
    document.getElementById('scanConfidence').textContent = document.getElementById('detectedConfidence').textContent.replace('CONFIDENCE: ', '');
}

// ================================================================
// 🔍 OSINT FUNCTIONS
// ================================================================

async function runOSINT(tool) {
    const endpoints = {
        'dork': { input: 'dorkInput', result: 'dorkResult', url: '/api/osint/dork' },
        'shodan': { input: 'shodanInput', result: 'shodanResult', url: '/api/osint/shodan' },
        'hibp': { input: 'hibpInput', result: 'hibpResult', url: '/api/osint/hibp' },
        'virustotal': { input: 'vtInput', result: 'vtResult', url: '/api/osint/virustotal' }
    };

    const config = endpoints[tool];
    if (!config) return;

    const input = document.getElementById(config.input);
    const result = document.getElementById(config.result);
    const query = input.value.trim() || 'example';

    result.innerHTML = '🔍 SCANNING...';
    result.className = 'result';

    try {
        const response = await fetch(config.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query, email: query, url: query })
        });
        const data = await response.json();
        
        if (data.status === 'success') {
            result.innerHTML = `✅ ${data.message || data.results || 'Complete'}`;
            result.className = 'result success';
        } else {
            result.innerHTML = '❌ Error';
            result.className = 'result error';
        }
    } catch (e) {
        result.innerHTML = '❌ Network error';
        result.className = 'result error';
    }
}

// ================================================================
// 🛡️ SECURITY FUNCTIONS
// ================================================================

async function runSecurity(tool) {
    const endpoints = {
        'threat': { input: 'threatInput', result: 'threatResult', url: '/api/security/threat' },
        'ssl': { input: 'sslInput', result: 'sslResult', url: '/api/security/ssl' },
        'phish': { input: 'phishInput', result: 'phishResult', url: '/api/security/phish' },
        'ip': { input: 'ipInput', result: 'ipResult', url: '/api/security/ip' }
    };

    const config = endpoints[tool];
    if (!config) return;

    const input = document.getElementById(config.input);
    const result = document.getElementById(config.result);
    const query = input.value.trim() || 'target';

    result.innerHTML = '🛡️ ANALYZING...';
    result.className = 'result';

    try {
        const response = await fetch(config.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target: query, domain: query, input: query, ip: query })
        });
        const data = await response.json();
        
        if (data.status === 'success') {
            result.innerHTML = `✅ ${data.message || data.risk || 'Complete'}`;
            result.className = 'result success';
        } else {
            result.innerHTML = '❌ Error';
            result.className = 'result error';
        }
    } catch (e) {
        result.innerHTML = '❌ Network error';
        result.className = 'result error';
    }
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
                datasets: [{ 
                    label: 'THREATS', 
                    data: [45, 52, 38, 65, 71, 48, 56], 
                    borderColor: '#1B3A5C',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });

        new Chart(document.getElementById('attackChart'), {
            type: 'doughnut',
            data: {
                labels: ['DDOS', 'PHISHING', 'MALWARE', 'RANSOM', 'OTHER'],
                datasets: [{
                    data: [30, 25, 20, 15, 10],
                    backgroundColor: ['#1B3A5C', '#D4A843', '#2E7D32', '#C62828', '#6A7A8A'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: { legend: { position: 'bottom', labels: { font: { size: 9 } } } }
            }
        });
    } catch (e) {}
}, 500);

// ================================================================
// 📊 EXPORT
// ================================================================

async function exportData(format) {
    try {
        if (format === 'csv') {
            window.open('/api/export/csv', '_blank');
        } else if (format === 'json') {
            window.open('/api/export/json', '_blank');
        }
    } catch (e) {
        alert('Export error');
    }
}

// ================================================================
// 🔄 TIMELINE
// ================================================================

async function updateTimeline() {
    try {
        const response = await fetch('/api/timeline');
        const events = await response.json();
        const container = document.getElementById('timeline');
        
        container.innerHTML = events.map(e => `
            <div class="timeline-item">
                <span class="time">${e.time}</span>
                <span class="event">${e.event}</span>
            </div>
        `).join('');
    } catch (e) {}
}

setInterval(updateTimeline, 5000);
updateTimeline();

// ================================================================
// 🚀 INIT
// ================================================================

console.log('%c⚡ MK CYBER HUB v8.1 - OPTIMIZED', 'font-size:20px;color:#1B3A5C;font-weight:900');
console.log('%c🚀 Fast & Lightweight Version', 'font-size:14px;color:#44DD88');

setTimeout(loadModel, 1500);
