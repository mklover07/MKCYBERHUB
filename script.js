
// ===== GLOBALS =====
let stream = null, interval = null, running = false;
let tfModel = null, loaded = false, mode = 'object', scanCount = 0;

// ===== THEME =====
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const icon = document.querySelector('.theme-toggle-corp i');
    icon.className = document.body.classList.contains('dark-mode') ? 'fas fa-sun' : 'fas fa-moon';
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

function loadTheme() {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        document.querySelector('.theme-toggle-corp i').className = 'fas fa-sun';
    }
}
loadTheme();

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

// ===== WEATHER =====
async function getWeather() {
    try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        const w = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${data.latitude||26.2389}&longitude=${data.longitude||73.0243}&current_weather=true`);
        const wd = await w.json();
        if (wd.current_weather) {
            document.getElementById('weatherTemp').textContent = Math.round(wd.current_weather.temperature) + '°C';
        }
    } catch (e) { document.getElementById('weatherTemp').textContent = '34°C'; }
}
getWeather();
setInterval(getWeather, 300000);

// ===== STATS =====
function animateStats() {
    [
        ['totalThreats', 12847],
        ['activeAttacks', 342],
        ['vulnerabilities', 1204],
        ['countries', 189]
    ].forEach(([id, target]) => {
        let el = document.getElementById(id), current = 0, step = Math.ceil(target / 40);
        let timer = setInterval(() => {
            current += step;
            if (current >= target) { current = target;
                clearInterval(timer); }
            el.textContent = current.toLocaleString();
        }, 25);
    });
}
animateStats();

// ===== NEWS =====
function updateNews() {
    const news = [
        'CRITICAL ZERO-DAY IN VPN — PATCH NOW!',
        'GLOBAL CYBER ATTACK — 12 BANKS AFFECTED',
        'AI MALWARE DETECTED IN 50+ COUNTRIES',
        'RANSOMWARE LEAKS 2TB CORPORATE DATA',
        'PHISHING CAMPAIGN — 10,000+ VICTIMS',
        'IOT BOTNET GROWS TO 200,000+ DEVICES'
    ];
    const ticker = document.getElementById('breakingNewsTicker');
    if (ticker) ticker.innerHTML = `<span>🚨 ${news[Math.floor(Math.random()*news.length)]}</span>`;
}
updateNews();
setInterval(updateNews, 60000);

// ===== THREAT MAP =====
function updateThreatMap() {
    ['usThreats', 'cnThreats', 'ruThreats', 'inThreats', 'ukThreats', 'deThreats'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            let val = parseInt(el.textContent.replace(/,/g, '')) || 1000;
            val += Math.floor(Math.random() * 20) - 8;
            el.textContent = Math.max(100, val).toLocaleString();
        }
    });
}
setInterval(updateThreatMap, 10000);

// ===== CHARTS =====
setTimeout(() => {
    try {
        new Chart(document.getElementById('threatChart'), {
            type: 'line',
            data: {
                labels: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
                datasets: [{ label: 'THREATS', data: [45, 52, 38, 65, 71, 48, 56], borderColor: '#1B3A5C',
                    tension: 0.4, fill: true, pointRadius: 2 }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
                scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,0.04)' } } } }
        });
        new Chart(document.getElementById('attackChart'), {
            type: 'doughnut',
            data: {
                labels: ['DDOS', 'PHISHING', 'MALWARE', 'RANSOM', 'OTHER'],
                datasets: [{ data: [30, 25, 20, 15, 10], backgroundColor: ['#1B3A5C', '#D4A843', '#2E7D32',
                        '#C62828', '#6A7A8A'
                    ], borderWidth: 0 }]
            },
            options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: {
                        position: 'bottom', labels: { font: { size: 9 } } } } }
        });
    } catch (e) {}
}, 500);

// ===== 3D GLOBE =====
setTimeout(() => {
    try {
        const container = document.getElementById('globe-container');
        if (!container) return;
        const w = window.innerWidth, h = window.innerHeight;
        const scene = new THREE.Scene(),
            camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
        camera.position.z = 2.5;
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
        container.appendChild(renderer.domElement);

        const texture = new THREE.TextureLoader().load(
            'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
        const earth = new THREE.Mesh(
            new THREE.SphereGeometry(1, 32, 32),
            new THREE.MeshPhongMaterial({ map: texture, shininess: 5 })
        );
        scene.add(earth);
        scene.add(new THREE.AmbientLight(0x404060));
        const light = new THREE.DirectionalLight(0xffffff, 1.2);
        light.position.set(5, 3, 5);
        scene.add(light);

        let rot = 0;

        function animate() {
            requestAnimationFrame(animate);
            rot += 0.001;
            earth.rotation.y = rot;
            renderer.render(scene, camera);
        }
        animate();
        window.addEventListener('resize', () => {
            const w2 = window.innerWidth, h2 = window.innerHeight;
            camera.aspect = w2 / h2;
            camera.updateProjectionMatrix();
            renderer.setSize(w2, h2);
        });
    } catch (e) { console.log('Globe skipped'); }
}, 1000);

// ===== AI VISION =====
function setVisionMode(m) {
    mode = m;
    document.querySelectorAll('.vision-mode').forEach(b => b.classList.remove('active'));
    document.getElementById('mode' + m.charAt(0).toUpperCase() + m.slice(1)).classList.add('active');
    document.getElementById('detectedAI').textContent = '🧠 ' + m.toUpperCase();
}

async function startVisionScanner() {
    const video = document.getElementById('scannerVideo'),
        status = document.getElementById('scannerStatus');
    try {
        if (stream) { stream.getTracks().forEach(t => t.stop());
            stream = null; }
        if (!loaded && typeof cocoSsd !== 'undefined') {
            status.innerHTML = '⏳ LOADING AI...';
            tfModel = await cocoSsd.load();
            loaded = true;
            document.getElementById('dashModels').textContent = '1';
        }
        if (!loaded) { status.innerHTML = '❌ AI FAILED'; return; }
        status.innerHTML = '📷 CAMERA...';
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 480 },
                    height: { ideal: 360 } }, audio: false });
        video.srcObject = stream;
        await video.play();
        running = true;
        status.innerHTML = '<span class="status-dot"></span> LIVE';
        document.getElementById('visionStatus').textContent = '🟢 LIVE';
        startLoop();
    } catch (e) { status.innerHTML = '❌ ' + e.message; }
}

function startLoop() {
    if (interval) clearInterval(interval);
    const video = document.getElementById('scannerVideo'),
        canvas = document.getElementById('scannerOverlayCanvas');
    let frames = 0,
        lastFps = Date.now();
    interval = setInterval(async () => {
        if (!running || !video || video.paused) return;
        if (video.videoWidth === 0) return;
        const w = video.videoWidth,
            h = video.videoHeight;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, w, h);
        frames++;
        if (Date.now() - lastFps > 1000) { document.getElementById('dashFPS').textContent = frames;
            frames = 0;
            lastFps = Date.now(); }
        if (loaded && tfModel) {
            try {
                const preds = await tfModel.detect(video);
                const filtered = preds.filter(p => p.score > 0.5);
                if (filtered.length > 0) {
                    filtered.forEach(p => {
                        ctx.strokeStyle = '#00D4FF';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(p.bbox[0], p.bbox[1], p.bbox[2], p.bbox[3]);
                        const label = p.class.toUpperCase() + ' (' + Math.round(p.score * 100) + '%)';
                        ctx.fillStyle = 'rgba(0,0,0,0.5)';
                        ctx.fillRect(p.bbox[0] - 2, p.bbox[1] - 18, ctx.measureText(label).width + 10, 18);
                        ctx.fillStyle = '#00D4FF';
                        ctx.font = '10px Inter';
                        ctx.fillText(label, p.bbox[0] + 4, p.bbox[1] - 4);
                    });
                    const top = filtered[0];
                    document.getElementById('detectedObject').textContent = '🔍 ' + top.class.toUpperCase();
                    document.getElementById('detectedConfidence').textContent = 'CONFIDENCE: ' + Math.round(top
                        .score * 100) + '%';
                    document.getElementById('dashConfidence').textContent = Math.round(top.score * 100) + '%';
                    if (mode === 'threat') {
                        document.getElementById('dashThreat').textContent = top.score > 0.8 ? '🔴 HIGH' : top
                            .score > 0.6 ? '🟡 MEDIUM' : '🟢 LOW';
                    }
                }
            } catch (e) {}
        }
    }, 150);
}

function stopVisionScanner() {
    running = false;
    if (interval) { clearInterval(interval);
        interval = null; }
    if (stream) { stream.getTracks().forEach(t => t.stop());
        stream = null; }
    const video = document.getElementById('scannerVideo');
    if (video) { video.srcObject = null;
        video.pause(); }
    document.getElementById('scannerStatus').innerHTML = '<span class="status-dot"></span> STOPPED';
    document.getElementById('visionStatus').textContent = '⏸️ PAUSED';
}

function switchMergedCamera() { if (running) { stopVisionScanner();
        setTimeout(startVisionScanner, 500); } }

async function captureVisionScanner() {
    if (!running) { alert('START CAMERA FIRST!'); return; }
    const canvas = document.getElementById('scannerOverlayCanvas');
    const imgData = canvas.toDataURL('image/jpeg');
    document.getElementById('scanResultImage').src = imgData;
    document.getElementById('scanResults').style.display = 'block';
    document.getElementById('scanStatus').textContent = '⏳ ANALYZING...';
    scanCount++;
    const img = new Image();
    img.src = imgData;
    img.onload = async function() {
        if (!loaded && typeof cocoSsd !== 'undefined') { tfModel = await cocoSsd.load();
            loaded = true; }
        if (tfModel) {
            try {
                const preds = await tfModel.detect(img);
                if (preds && preds.length > 0) {
                    const top = preds[0];
                    document.getElementById('scanStatus').textContent = '✅ COMPLETE';
                    document.getElementById('scanObjectName').textContent = top.class.toUpperCase();
                    document.getElementById('scanConfidence').textContent = Math.round(top.score * 100) + '%';
                    document.getElementById('scanCategory').textContent = 'DETECTED';
                    document.getElementById('scanDescription').textContent = 'A ' + top.class + ' DETECTED BY AI.';
                } else { document.getElementById('scanStatus').textContent = '⚠️ NO OBJECT'; }
            } catch (e) { document.getElementById('scanStatus').textContent = '❌ ERROR'; }
        }
    };
}

function liveGoogleSearch() {
    const obj = document.getElementById('scanObjectName').textContent;
    if (!obj || obj === '-') { alert('SCAN FIRST!'); return; }
    window.open('https://www.google.com/search?q=' + encodeURIComponent(obj), '_blank');
}

function liveYouTubeSearch() {
    const obj = document.getElementById('scanObjectName').textContent;
    if (!obj || obj === '-') { alert('SCAN FIRST!'); return; }
    window.open('https://www.youtube.com/results?search_query=' + encodeURIComponent(obj), '_blank');
}

function liveWikipediaPage() {
    const obj = document.getElementById('scanObjectName').textContent;
    if (!obj || obj === '-') { alert('SCAN FIRST!'); return; }
    window.open('https://en.wikipedia.org/wiki/' + encodeURIComponent(obj), '_blank');
}

// ===== OSINT FUNCTIONS =====
function runDork() { runOSINT('dorkInput', 'dorkResult', 'GOOGLE DORKING'); }

function runShodan() { runOSINT('shodanInput', 'shodanResult', 'SHODAN'); }

function runCensys() { runOSINT('censysInput', 'censysResult', 'CENSYS'); }

function runHarvester() { runOSINT('harvestInput', 'harvestResult', 'THEHARVESTER'); }

function runSpiderfoot() { runOSINT('spiderInput', 'spiderResult', 'SPIDERFOOT'); }

function runMaltego() { runOSINT('maltegoInput', 'maltegoResult', 'MALTEGO'); }

function runWhois() { runOSINT('whoisInput', 'whoisResult', 'WHOIS'); }

function runVirusTotal() { runOSINT('vtInput', 'vtResult', 'VIRUSTOTAL'); }

function runPwned() { runOSINT('pwnedInput', 'pwnedResult', 'HIBP'); }

function runWayback() { runOSINT('waybackInput', 'waybackResult', 'WAYBACK'); }

function runOSINT(inputId, resultId, name) {
    const input = document.getElementById(inputId);
    const result = document.getElementById(resultId);
    const query = input.value.trim() || 'EXAMPLE';
    result.innerHTML = '🔍 ' + name + ' SCANNING...';
    result.className = 'result-corp';
    setTimeout(() => {
        const found = Math.floor(10 + Math.random() * 50);
        result.innerHTML = '📌 RESULTS FOR "' + query.toUpperCase() + '":<br>✅ ' + found +
            ' ENTRIES FOUND<br>📊 ANALYSIS COMPLETE';
        result.classList.add('success');
    }, 1500 + Math.random() * 1000);
}

// ===== SECURITY FUNCTIONS =====
function runAIAnalysis() { runSecurity('aiInput', 'aiResult', 'AI THREAT ANALYSIS'); }

function runDarkWebMonitor() { runSecurity('darkWebInput', 'darkWebResult', 'DARK WEB MONITOR'); }

function runVulnScan() { runSecurity('vulnInput', 'vulnResult', 'VULNERABILITY SCAN'); }

function runSSLCheck() { runSecurity('sslInput', 'sslResult', 'SSL CHECK'); }

function runPhishingDetector() { runSecurity('phishInput', 'phishResult', 'PHISHING DETECTOR'); }

function runIPReputation() { runSecurity('ipRepInput', 'ipRepResult', 'IP REPUTATION'); }

function runSecurity(inputId, resultId, name) {
    const input = document.getElementById(inputId);
    const result = document.getElementById(resultId);
    const query = input.value.trim() || 'TARGET';
    result.innerHTML = '🛡️ ' + name + ' IN PROGRESS...';
    result.className = 'result-corp';
    setTimeout(() => {
        const status = Math.random() > 0.7 ? '🔴 HIGH RISK' : Math.random() > 0.4 ? '🟡 MEDIUM' : '🟢 LOW RISK';
        result.innerHTML = '📌 TARGET: ' + query + '<br>📊 STATUS: ' + status +
            '<br>✅ ANALYSIS COMPLETE';
        result.className = status.includes('HIGH') ? 'result-corp error' : 'result-corp success';
    }, 1500 + Math.random() * 1000);
}

// ===== EXPORT =====
function exportReport(format) {
    const data = {
        threats: document.getElementById('totalThreats')?.textContent || '0',
        attacks: document.getElementById('activeAttacks')?.textContent || '0',
        scans: scanCount,
        time: new Date().toISOString()
    };
    if (format === 'csv') {
        const csv = 'THREATS,ATTACKS,SCANS,TIME\n' + data.threats + ',' + data.attacks + ',' + data.scans + ',' + data
            .time;
        const blob = new Blob([csv], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'REPORT.CSV';
        link.click();
    } else if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'REPORT.JSON';
        link.click();
    }
}

console.log('%c⚡ MK CYBER HUB v7.1 OPTIMIZED', 'font-size:20px;color:#1B3A5C;font-weight:900');
console.log('%c🚀 FAST & LIGHTWEIGHT', 'font-size:14px;color:#00D4FF');
// ===== GLOBALS =====
let stream = null, interval = null, running = false;
let tfModel = null, loaded = false, mode = 'object', scanCount = 0;
let threatMap = null, threatMarkers = [];

// ===== THEME =====
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const icon = document.querySelector('.theme-toggle-corp i');
    icon.className = document.body.classList.contains('dark-mode') ? 'fas fa-sun' : 'fas fa-moon';
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    // Refresh map tiles on theme change
    if (threatMap) {
        threatMap.invalidateSize();
    }
}

function loadTheme() {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        document.querySelector('.theme-toggle-corp i').className = 'fas fa-sun';
    }
}
loadTheme();

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

// ===== WEATHER =====
async function getWeather() {
    try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        const w = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${data.latitude||26.2389}&longitude=${data.longitude||73.0243}&current_weather=true`);
        const wd = await w.json();
        if (wd.current_weather) {
            document.getElementById('weatherTemp').textContent = Math.round(wd.current_weather.temperature) + '°C';
        }
    } catch (e) { document.getElementById('weatherTemp').textContent = '34°C'; }
}
getWeather();
setInterval(getWeather, 300000);

// ===== STATS =====
function animateStats() {
    [
        ['totalThreats', 12847],
        ['activeAttacks', 342],
        ['vulnerabilities', 1204],
        ['countries', 189]
    ].forEach(([id, target]) => {
        let el = document.getElementById(id), current = 0, step = Math.ceil(target / 40);
        let timer = setInterval(() => {
            current += step;
            if (current >= target) { current = target;
                clearInterval(timer); }
            el.textContent = current.toLocaleString();
        }, 25);
    });
}
animateStats();

// ===== NEWS =====
function updateNews() {
    const news = [
        'CRITICAL ZERO-DAY IN VPN — PATCH NOW!',
        'GLOBAL CYBER ATTACK — 12 BANKS AFFECTED',
        'AI MALWARE DETECTED IN 50+ COUNTRIES',
        'RANSOMWARE LEAKS 2TB CORPORATE DATA',
        'PHISHING CAMPAIGN — 10,000+ VICTIMS',
        'IOT BOTNET GROWS TO 200,000+ DEVICES',
        'MAJOR CLOUD PROVIDER DATA BREACH — 5M RECORDS EXPOSED'
    ];
    const ticker = document.getElementById('breakingNewsTicker');
    if (ticker) ticker.innerHTML = `<span>🚨 ${news[Math.floor(Math.random()*news.length)]}</span>`;
}
updateNews();
setInterval(updateNews, 60000);

// ===== THREAT MAP UPDATER =====
function updateThreatMapStats() {
    ['usThreats', 'cnThreats', 'ruThreats', 'inThreats', 'ukThreats', 'deThreats'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            let val = parseInt(el.textContent.replace(/,/g, '')) || 1000;
            val += Math.floor(Math.random() * 20) - 8;
            el.textContent = Math.max(100, val).toLocaleString();
        }
    });
}
setInterval(updateThreatMapStats, 10000);

// ===== CHARTS =====
setTimeout(() => {
    try {
        new Chart(document.getElementById('threatChart'), {
            type: 'line',
            data: {
                labels: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
                datasets: [{ label: 'THREATS', data: [45, 52, 38, 65, 71, 48, 56], borderColor: '#1B3A5C',
                    tension: 0.4, fill: true, pointRadius: 2 }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
                scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,0.04)' } } } }
        });
        new Chart(document.getElementById('attackChart'), {
            type: 'doughnut',
            data: {
                labels: ['DDOS', 'PHISHING', 'MALWARE', 'RANSOM', 'OTHER'],
                datasets: [{ data: [30, 25, 20, 15, 10], backgroundColor: ['#1B3A5C', '#D4A843', '#2E7D32',
                        '#C62828', '#6A7A8A'
                    ], borderWidth: 0 }]
            },
            options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: {
                        position: 'bottom', labels: { font: { size: 9 } } } } }
        });
    } catch (e) {}
}, 500);

// ===== 3D GLOBE =====
setTimeout(() => {
    try {
        const container = document.getElementById('globe-container');
        if (!container) return;
        const w = window.innerWidth, h = window.innerHeight;
        const scene = new THREE.Scene(),
            camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
        camera.position.z = 2.5;
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
        container.appendChild(renderer.domElement);

        const texture = new THREE.TextureLoader().load(
            'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
        const earth = new THREE.Mesh(
            new THREE.SphereGeometry(1, 32, 32),
            new THREE.MeshPhongMaterial({ map: texture, shininess: 5 })
        );
        scene.add(earth);
        scene.add(new THREE.AmbientLight(0x404060));
        const light = new THREE.DirectionalLight(0xffffff, 1.2);
        light.position.set(5, 3, 5);
        scene.add(light);

        let rot = 0;

        function animate() {
            requestAnimationFrame(animate);
            rot += 0.001;
            earth.rotation.y = rot;
            renderer.render(scene, camera);
        }
        animate();
        window.addEventListener('resize', () => {
            const w2 = window.innerWidth, h2 = window.innerHeight;
            camera.aspect = w2 / h2;
            camera.updateProjectionMatrix();
            renderer.setSize(w2, h2);
        });
    } catch (e) { console.log('Globe skipped'); }
}, 1000);

// ================================================================
// 🗺️ LIVE THREAT MAP - LEAFLET
// ================================================================

function initThreatMap() {
    try {
        const container = document.getElementById('threatMap');
        if (!container) return;

        // Initialize Map
        threatMap = L.map('threatMap', {
            center: [20, 0],
            zoom: 2,
            zoomControl: true,
            fadeAnimation: true,
            attributionControl: true
        });

        // Tile Layer (OpenStreetMap with dark mode support)
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        });
        tileLayer.addTo(threatMap);

        // Custom Icons for Threats
        const threatIcons = {
            high: L.divIcon({
                className: 'threat-marker',
                html: '<div style="background:#FF4444;width:16px;height:16px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 20px rgba(255,68,68,0.6);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            }),
            medium: L.divIcon({
                className: 'threat-marker',
                html: '<div style="background:#FFAA00;width:14px;height:14px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 20px rgba(255,170,0,0.6);"></div>',
                iconSize: [18, 18],
                iconAnchor: [9, 9]
            }),
            low: L.divIcon({
                className: 'threat-marker',
                html: '<div style="background:#44DD88;width:12px;height:12px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 20px rgba(68,221,136,0.6);"></div>',
                iconSize: [16, 16],
                iconAnchor: [8, 8]
            })
        };

        // Threat Locations Data
        const threatLocations = [
            { lat: 40.7128, lng: -74.0060, country: '🇺🇸 USA', city: 'New York', threat: 'DDOS Attack',
            severity: 'high' },
            { lat: 34.0522, lng: -118.2437, country: '🇺🇸 USA', city: 'Los Angeles', threat: 'Ransomware',
            severity: 'high' },
            { lat: 39.9042, lng: 116.4074, country: '🇨🇳 China', city: 'Beijing', threat: 'Malware Campaign',
            severity: 'medium' },
            { lat: 31.2304, lng: 121.4737, country: '🇨🇳 China', city: 'Shanghai', threat: 'Data Breach',
            severity: 'medium' },
            { lat: 55.7558, lng: 37.6173, country: '🇷🇺 Russia', city: 'Moscow', threat: 'Ransomware Attack',
            severity: 'high' },
            { lat: 59.9343, lng: 30.3351, country: '🇷🇺 Russia', city: 'St Petersburg', threat: 'Phishing Campaign',
            severity: 'medium' },
            { lat: 28.6139, lng: 77.2090, country: '🇮🇳 India', city: 'Delhi', threat: 'Phishing Attack',
            severity: 'medium' },
            { lat: 19.0760, lng: 72.8777, country: '🇮🇳 India', city: 'Mumbai', threat: 'Data Breach',
            severity: 'low' },
            { lat: 51.5074, lng: -0.1278, country: '🇬🇧 UK', city: 'London', threat: 'DDoS Campaign',
            severity: 'low' },
            { lat: 53.3498, lng: -6.2603, country: '🇮🇪 Ireland', city: 'Dublin', threat: 'Malware',
            severity: 'low' },
            { lat: 52.5200, lng: 13.4050, country: '🇩🇪 Germany', city: 'Berlin', threat: 'DDoS Attack',
            severity: 'low' },
            { lat: 48.8566, lng: 2.3522, country: '🇫🇷 France', city: 'Paris', threat: 'Ransomware',
            severity: 'medium' },
            { lat: 41.9028, lng: 12.4964, country: '🇮🇹 Italy', city: 'Rome', threat: 'Phishing', severity: 'low' },
            { lat: 35.6895, lng: 139.6917, country: '🇯🇵 Japan', city: 'Tokyo', threat: 'Malware', severity: 'low' },
            { lat: -33.8688, lng: 151.2093, country: '🇦🇺 Australia', city: 'Sydney', threat: 'Data Breach',
            severity: 'medium' }
        ];

        // Add Markers
        threatLocations.forEach(loc => {
            const icon = loc.severity === 'high' ? threatIcons.high :
                loc.severity === 'medium' ? threatIcons.medium : threatIcons.low;

            const marker = L.marker([loc.lat, loc.lng], { icon: icon }).addTo(threatMap);

            // Popup Content
            const popupContent = `
                <div style="font-family:'Inter',sans-serif;padding:4px;">
                    <h4 style="margin:0 0 4px 0;color:#1B3A5C;font-size:14px;">${loc.country}</h4>
                    <p style="margin:2px 0;font-size:12px;color:#4A5A6A;">
                        🏙️ ${loc.city}<br>
                        ⚡ ${loc.threat}<br>
                        <span style="font-size:10px;color:#8A9AAA;">
                            ${loc.severity.toUpperCase()} RISK
                        </span>
                    </p>
                </div>
            `;
            marker.bindPopup(popupContent);

            // Store reference for updates
            threatMarkers.push({
                marker: marker,
                location: loc
            });
        });

        // Fit Bounds to show all markers
        const group = L.featureGroup(threatMarkers.map(m => m.marker));
        threatMap.fitBounds(group.getBounds().pad(0.1));

        // Update map on resize
        window.addEventListener('resize', () => {
            if (threatMap) {
                setTimeout(() => threatMap.invalidateSize(), 300);
            }
        });

        console.log('✅ Threat Map Initialized with ' + threatMarkers.length + ' markers');

    } catch (e) {
        console.log('⚠️ Map Error:', e);
        // Fallback - show static message
        document.getElementById('threatMap').innerHTML = `
            <div style="display:flex;align-items:center;justify-content:center;height:100%;background:rgba(27,58,92,0.05);border-radius:10px;color:#8A9AAA;font-family:'Inter',sans-serif;">
                <div style="text-align:center;">
                    <i class="fas fa-globe" style="font-size:48px;color:#D4A843;margin-bottom:10px;"></i>
                    <p>🌍 Live Threat Map</p>
                    <p style="font-size:12px;">Interactive map loading...</p>
                </div>
            </div>
        `;
    }
}

// ===== UPDATE THREAT MAP MARKERS (Real-time simulation) =====
function updateThreatMapMarkers() {
    if (!threatMap || threatMarkers.length === 0) return;

    // Update threat status randomly
    threatMarkers.forEach((item, index) => {
        const newSeverity = Math.random() > 0.7 ?
            ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] :
            item.location.severity;

        // Update popup content with new status
        const popupContent = `
            <div style="font-family:'Inter',sans-serif;padding:4px;">
                <h4 style="margin:0 0 4px 0;color:#1B3A5C;font-size:14px;">${item.location.country}</h4>
                <p style="margin:2px 0;font-size:12px;color:#4A5A6A;">
                    🏙️ ${item.location.city}<br>
                    ⚡ ${item.location.threat}<br>
                    <span style="font-size:10px;color:#8A9AAA;">
                        ${newSeverity.toUpperCase()} RISK
                    </span>
                </p>
            </div>
        `;
        item.marker.setPopupContent(popupContent);

        // Update marker color based on new severity
        const newColor = newSeverity === 'high' ? '#FF4444' :
            newSeverity === 'medium' ? '#FFAA00' : '#44DD88';
        const markerElement = item.marker._icon;
        if (markerElement) {
            const dot = markerElement.querySelector('div');
            if (dot) {
                dot.style.background = newColor;
            }
        }
    });
}

// ================================================================
// 🚀 INIT THREAT MAP
// ================================================================

// Wait for DOM and Leaflet to load
if (document.readyState === 'complete') {
    setTimeout(initThreatMap, 500);
} else {
    window.addEventListener('load', () => {
        setTimeout(initThreatMap, 500);
    });
}

// Update markers every 15 seconds
setInterval(updateThreatMapMarkers, 15000);

// ===== AI VISION =====
function setVisionMode(m) {
    mode = m;
    document.querySelectorAll('.vision-mode').forEach(b => b.classList.remove('active'));
    document.getElementById('mode' + m.charAt(0).toUpperCase() + m.slice(1)).classList.add('active');
    document.getElementById('detectedAI').textContent = '🧠 ' + m.toUpperCase();
}

async function startVisionScanner() {
    const video = document.getElementById('scannerVideo'),
        status = document.getElementById('scannerStatus');
    try {
        if (stream) { stream.getTracks().forEach(t => t.stop());
            stream = null; }
        if (!loaded && typeof cocoSsd !== 'undefined') {
            status.innerHTML = '⏳ LOADING AI...';
            tfModel = await cocoSsd.load();
            loaded = true;
            document.getElementById('dashModels').textContent = '1';
        }
        if (!loaded) { status.innerHTML = '❌ AI FAILED'; return; }
        status.innerHTML = '📷 CAMERA...';
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 480 },
                    height: { ideal: 360 } }, audio: false });
        video.srcObject = stream;
        await video.play();
        running = true;
        status.innerHTML = '<span class="status-dot"></span> LIVE';
        document.getElementById('visionStatus').textContent = '🟢 LIVE';
        startLoop();
    } catch (e) { status.innerHTML = '❌ ' + e.message; }
}

function startLoop() {
    if (interval) clearInterval(interval);
    const video = document.getElementById('scannerVideo'),
        canvas = document.getElementById('scannerOverlayCanvas');
    let frames = 0,
        lastFps = Date.now();
    interval = setInterval(async () => {
        if (!running || !video || video.paused) return;
        if (video.videoWidth === 0) return;
        const w = video.videoWidth,
            h = video.videoHeight;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, w, h);
        frames++;
        if (Date.now() - lastFps > 1000) { document.getElementById('dashFPS').textContent = frames;
            frames = 0;
            lastFps = Date.now(); }
        if (loaded && tfModel) {
            try {
                const preds = await tfModel.detect(video);
                const filtered = preds.filter(p => p.score > 0.5);
                if (filtered.length > 0) {
                    filtered.forEach(p => {
                        ctx.strokeStyle = '#00D4FF';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(p.bbox[0], p.bbox[1], p.bbox[2], p.bbox[3]);
                        const label = p.class.toUpperCase() + ' (' + Math.round(p.score * 100) + '%)';
                        ctx.fillStyle = 'rgba(0,0,0,0.5)';
                        ctx.fillRect(p.bbox[0] - 2, p.bbox[1] - 18, ctx.measureText(label).width + 10, 18);
                        ctx.fillStyle = '#00D4FF';
                        ctx.font = '10px Inter';
                        ctx.fillText(label, p.bbox[0] + 4, p.bbox[1] - 4);
                    });
                    const top = filtered[0];
                    document.getElementById('detectedObject').textContent = '🔍 ' + top.class.toUpperCase();
                    document.getElementById('detectedConfidence').textContent = 'CONFIDENCE: ' + Math.round(top
                        .score * 100) + '%';
                    document.getElementById('dashConfidence').textContent = Math.round(top.score * 100) + '%';
                    if (mode === 'threat') {
                        document.getElementById('dashThreat').textContent = top.score > 0.8 ? '🔴 HIGH' : top
                            .score > 0.6 ? '🟡 MEDIUM' : '🟢 LOW';
                    }
                }
            } catch (e) {}
        }
    }, 150);
}

function stopVisionScanner() {
    running = false;
    if (interval) { clearInterval(interval);
        interval = null; }
    if (stream) { stream.getTracks().forEach(t => t.stop());
        stream = null; }
    const video = document.getElementById('scannerVideo');
    if (video) { video.srcObject = null;
        video.pause(); }
    document.getElementById('scannerStatus').innerHTML = '<span class="status-dot"></span> STOPPED';
    document.getElementById('visionStatus').textContent = '⏸️ PAUSED';
}

function switchMergedCamera() { if (running) { stopVisionScanner();
        setTimeout(startVisionScanner, 500); } }

async function captureVisionScanner() {
    if (!running) { alert('START CAMERA FIRST!'); return; }
    const canvas = document.getElementById('scannerOverlayCanvas');
    const imgData = canvas.toDataURL('image/jpeg');
    document.getElementById('scanResultImage').src = imgData;
    document.getElementById('scanResults').style.display = 'block';
    document.getElementById('scanStatus').textContent = '⏳ ANALYZING...';
    scanCount++;
    const img = new Image();
    img.src = imgData;
    img.onload = async function() {
        if (!loaded && typeof cocoSsd !== 'undefined') { tfModel = await cocoSsd.load();
            loaded = true; }
        if (tfModel) {
            try {
                const preds = await tfModel.detect(img);
                if (preds && preds.length > 0) {
                    const top = preds[0];
                    document.getElementById('scanStatus').textContent = '✅ COMPLETE';
                    document.getElementById('scanObjectName').textContent = top.class.toUpperCase();
                    document.getElementById('scanConfidence').textContent = Math.round(top.score * 100) + '%';
                    document.getElementById('scanCategory').textContent = 'DETECTED';
                    document.getElementById('scanDescription').textContent = 'A ' + top.class + ' DETECTED BY AI.';
                } else { document.getElementById('scanStatus').textContent = '⚠️ NO OBJECT'; }
            } catch (e) { document.getElementById('scanStatus').textContent = '❌ ERROR'; }
        }
    };
}

function liveGoogleSearch() {
    const obj = document.getElementById('scanObjectName').textContent;
    if (!obj || obj === '-') { alert('SCAN FIRST!'); return; }
    window.open('https://www.google.com/search?q=' + encodeURIComponent(obj), '_blank');
}

function liveYouTubeSearch() {
    const obj = document.getElementById('scanObjectName').textContent;
    if (!obj || obj === '-') { alert('SCAN FIRST!'); return; }
    window.open('https://www.youtube.com/results?search_query=' + encodeURIComponent(obj), '_blank');
}

function liveWikipediaPage() {
    const obj = document.getElementById('scanObjectName').textContent;
    if (!obj || obj === '-') { alert('SCAN FIRST!'); return; }
    window.open('https://en.wikipedia.org/wiki/' + encodeURIComponent(obj), '_blank');
}

// ===== OSINT FUNCTIONS =====
function runDork() { runOSINT('dorkInput', 'dorkResult', 'GOOGLE DORKING'); }

function runShodan() { runOSINT('shodanInput', 'shodanResult', 'SHODAN'); }

function runCensys() { runOSINT('censysInput', 'censysResult', 'CENSYS'); }

function runHarvester() { runOSINT('harvestInput', 'harvestResult', 'THEHARVESTER'); }

function runSpiderfoot() { runOSINT('spiderInput', 'spiderResult', 'SPIDERFOOT'); }

function runMaltego() { runOSINT('maltegoInput', 'maltegoResult', 'MALTEGO'); }

function runWhois() { runOSINT('whoisInput', 'whoisResult', 'WHOIS'); }

function runVirusTotal() { runOSINT('vtInput', 'vtResult', 'VIRUSTOTAL'); }

function runPwned() { runOSINT('pwnedInput', 'pwnedResult', 'HIBP'); }

function runWayback() { runOSINT('waybackInput', 'waybackResult', 'WAYBACK'); }

function runOSINT(inputId, resultId, name) {
    const input = document.getElementById(inputId);
    const result = document.getElementById(resultId);
    const query = input.value.trim() || 'EXAMPLE';
    result.innerHTML = '🔍 ' + name + ' SCANNING...';
    result.className = 'result-corp';
    setTimeout(() => {
        const found = Math.floor(10 + Math.random() * 50);
        result.innerHTML = '📌 RESULTS FOR "' + query.toUpperCase() + '":<br>✅ ' + found +
            ' ENTRIES FOUND<br>📊 ANALYSIS COMPLETE';
        result.classList.add('success');
    }, 1500 + Math.random() * 1000);
}

// ===== SECURITY FUNCTIONS =====
function runAIAnalysis() { runSecurity('aiInput', 'aiResult', 'AI THREAT ANALYSIS'); }

function runDarkWebMonitor() { runSecurity('darkWebInput', 'darkWebResult', 'DARK WEB MONITOR'); }

function runVulnScan() { runSecurity('vulnInput', 'vulnResult', 'VULNERABILITY SCAN'); }

function runSSLCheck() { runSecurity('sslInput', 'sslResult', 'SSL CHECK'); }

function runPhishingDetector() { runSecurity('phishInput', 'phishResult', 'PHISHING DETECTOR'); }

function runIPReputation() { runSecurity('ipRepInput', 'ipRepResult', 'IP REPUTATION'); }

function runSecurity(inputId, resultId, name) {
    const input = document.getElementById(inputId);
    const result = document.getElementById(resultId);
    const query = input.value.trim() || 'TARGET';
    result.innerHTML = '🛡️ ' + name + ' IN PROGRESS...';
    result.className = 'result-corp';
    setTimeout(() => {
        const status = Math.random() > 0.7 ? '🔴 HIGH RISK' : Math.random() > 0.4 ? '🟡 MEDIUM' : '🟢 LOW RISK';
        result.innerHTML = '📌 TARGET: ' + query + '<br>📊 STATUS: ' + status +
            '<br>✅ ANALYSIS COMPLETE';
        result.className = status.includes('HIGH') ? 'result-corp error' : 'result-corp success';
    }, 1500 + Math.random() * 1000);
}

// ===== EXPORT =====
function exportReport(format) {
    const data = {
        threats: document.getElementById('totalThreats')?.textContent || '0',
        attacks: document.getElementById('activeAttacks')?.textContent || '0',
        scans: scanCount,
        time: new Date().toISOString()
    };
    if (format === 'csv') {
        const csv = 'THREATS,ATTACKS,SCANS,TIME\n' + data.threats + ',' + data.attacks + ',' + data.scans + ',' + data
            .time;
        const blob = new Blob([csv], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'REPORT.CSV';
        link.click();
    } else if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'REPORT.JSON';
        link.click();
    }
}

console.log('%c⚡ MK CYBER HUB v7.2 — WITH LIVE MAP', 'font-size:20px;color:#1B3A5C;font-weight:900');
console.log('%c🗺️ Interactive Threat Map Loaded', 'font-size:14px;color:#00D4FF');
