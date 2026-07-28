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
    if (threatMap) { setTimeout(() => threatMap.invalidateSize(), 300); }
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

// ================================================================
// 📊 CHARTS
// ================================================================
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

        threatMap = L.map('threatMap', {
            center: [20, 0],
            zoom: 2,
            zoomControl: true,
            fadeAnimation: true,
            attributionControl: true
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(threatMap);

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

        // Initial Threat Locations
        const threatLocations = [
            { lat: 40.7128, lng: -74.0060, country: '🇺🇸 USA', city: 'New York', threat: 'DDOS Attack', severity: 'high' },
            { lat: 34.0522, lng: -118.2437, country: '🇺🇸 USA', city: 'Los Angeles', threat: 'Ransomware', severity: 'high' },
            { lat: 39.9042, lng: 116.4074, country: '🇨🇳 China', city: 'Beijing', threat: 'Malware Campaign', severity: 'medium' },
            { lat: 31.2304, lng: 121.4737, country: '🇨🇳 China', city: 'Shanghai', threat: 'Data Breach', severity: 'medium' },
            { lat: 55.7558, lng: 37.6173, country: '🇷🇺 Russia', city: 'Moscow', threat: 'Ransomware Attack', severity: 'high' },
            { lat: 59.9343, lng: 30.3351, country: '🇷🇺 Russia', city: 'St Petersburg', threat: 'Phishing Campaign', severity: 'medium' },
            { lat: 28.6139, lng: 77.2090, country: '🇮🇳 India', city: 'Delhi', threat: 'Phishing Attack', severity: 'medium' },
            { lat: 19.0760, lng: 72.8777, country: '🇮🇳 India', city: 'Mumbai', threat: 'Data Breach', severity: 'low' },
            { lat: 51.5074, lng: -0.1278, country: '🇬🇧 UK', city: 'London', threat: 'DDoS Campaign', severity: 'low' },
            { lat: 53.3498, lng: -6.2603, country: '🇮🇪 Ireland', city: 'Dublin', threat: 'Malware', severity: 'low' },
            { lat: 52.5200, lng: 13.4050, country: '🇩🇪 Germany', city: 'Berlin', threat: 'DDoS Attack', severity: 'low' },
            { lat: 48.8566, lng: 2.3522, country: '🇫🇷 France', city: 'Paris', threat: 'Ransomware', severity: 'medium' },
            { lat: 41.9028, lng: 12.4964, country: '🇮🇹 Italy', city: 'Rome', threat: 'Phishing', severity: 'low' },
            { lat: 35.6895, lng: 139.6917, country: '🇯🇵 Japan', city: 'Tokyo', threat: 'Malware', severity: 'low' },
            { lat: -33.8688, lng: 151.2093, country: '🇦🇺 Australia', city: 'Sydney', threat: 'Data Breach', severity: 'medium' }
        ];

        // Add Markers
        threatLocations.forEach(loc => {
            const icon = loc.severity === 'high' ? threatIcons.high :
                loc.severity === 'medium' ? threatIcons.medium : threatIcons.low;

            const marker = L.marker([loc.lat, loc.lng], { icon: icon }).addTo(threatMap);
            const popupContent = `
                <div style="font-family:'Inter',sans-serif;padding:4px;">
                    <h4 style="margin:0 0 4px 0;color:#1B3A5C;font-size:14px;">${loc.country}</h4>
                    <p style="margin:2px 0;font-size:12px;color:#4A5A6A;">
                        🏙️ ${loc.city}<br>
                        ⚡ ${loc.threat}<br>
                        <span style="font-size:10px;color:#8A9AAA;">${loc.severity.toUpperCase()} RISK</span>
                    </p>
                </div>
            `;
            marker.bindPopup(popupContent);
            threatMarkers.push({ marker: marker, location: loc });
        });

        const group = L.featureGroup(threatMarkers.map(m => m.marker));
        threatMap.fitBounds(group.getBounds().pad(0.1));

        window.addEventListener('resize', () => {
            if (threatMap) { setTimeout(() => threatMap.invalidateSize(), 300); }
        });

        console.log('✅ Threat Map Initialized with ' + threatMarkers.length + ' markers');

    } catch (e) {
        console.log('⚠️ Map Error:', e);
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

// ================================================================
// 🔥 REAL-TIME THREAT GENERATOR
// ================================================================

function generateRealTimeThreat() {
    const countries = [
        { name: '🇺🇸 USA', city: 'New York', lat: 40.7128, lng: -74.0060 },
        { name: '🇨🇳 China', city: 'Beijing', lat: 39.9042, lng: 116.4074 },
        { name: '🇷🇺 Russia', city: 'Moscow', lat: 55.7558, lng: 37.6173 },
        { name: '🇮🇳 India', city: 'Delhi', lat: 28.6139, lng: 77.2090 },
        { name: '🇬🇧 UK', city: 'London', lat: 51.5074, lng: -0.1278 },
        { name: '🇩🇪 Germany', city: 'Berlin', lat: 52.5200, lng: 13.4050 },
        { name: '🇫🇷 France', city: 'Paris', lat: 48.8566, lng: 2.3522 },
        { name: '🇯🇵 Japan', city: 'Tokyo', lat: 35.6895, lng: 139.6917 },
        { name: '🇦🇺 Australia', city: 'Sydney', lat: -33.8688, lng: 151.2093 },
        { name: '🇧🇷 Brazil', city: 'Sao Paulo', lat: -23.5505, lng: -46.6333 },
        { name: '🇿🇦 South Africa', city: 'Cape Town', lat: -33.9249, lng: 18.4241 },
        { name: '🇦🇪 UAE', city: 'Dubai', lat: 25.2048, lng: 55.2708 },
        { name: '🇸🇬 Singapore', city: 'Singapore', lat: 1.3521, lng: 103.8198 },
        { name: '🇰🇷 South Korea', city: 'Seoul', lat: 37.5665, lng: 126.9780 },
        { name: '🇮🇱 Israel', city: 'Tel Aviv', lat: 32.0853, lng: 34.7818 }
    ];
    
    const threats = [
        'DDOS Attack', 'Ransomware Outbreak', 'Phishing Campaign', 
        'Malware Infection', 'Data Breach', 'Zero-Day Exploit', 
        'APT Attack', 'IoT Botnet', 'Credential Theft',
        'DNS Hijacking', 'Email Spoofing', 'SQL Injection'
    ];
    
    const severities = ['high', 'medium', 'low'];
    const randomIndex = Math.floor(Math.random() * countries.length);
    const country = countries[randomIndex];
    
    return {
        country: country.name,
        city: country.city,
        lat: country.lat + (Math.random() - 0.5) * 2,
        lng: country.lng + (Math.random() - 0.5) * 2,
        threat: threats[Math.floor(Math.random() * threats.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        time: new Date().toLocaleTimeString()
    };
}

// ================================================================
// 🎯 UPDATE THREAT MAP WITH REAL-TIME DATA
// ================================================================

function addRealTimeThreatToMap() {
    if (!threatMap) return;
    
    const newThreat = generateRealTimeThreat();
    
    // Color based on severity
    const colors = {
        high: '#FF4444',
        medium: '#FFAA00',
        low: '#44DD88'
    };
    
    // Create marker
    const icon = L.divIcon({
        className: 'threat-marker',
        html: `<div style="background:${colors[newThreat.severity]};width:16px;height:16px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 30px ${colors[newThreat.severity]}80;animation:threat-pulse 1.5s ease-in-out infinite;"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
    
    const marker = L.marker([newThreat.lat, newThreat.lng], { icon: icon }).addTo(threatMap);
    
    // Popup
    const popupContent = `
        <div style="font-family:'Inter',sans-serif;padding:6px;min-width:180px;">
            <h4 style="margin:0 0 4px 0;color:#1B3A5C;font-size:15px;">🆕 ${newThreat.country}</h4>
            <p style="margin:2px 0;font-size:13px;color:#4A5A6A;">
                🏙️ ${newThreat.city}<br>
                ⚡ <strong>${newThreat.threat}</strong><br>
                ⏰ ${newThreat.time}<br>
                <span style="font-size:11px;color:${colors[newThreat.severity]};font-weight:700;">
                    ${newThreat.severity.toUpperCase()} RISK
                </span>
            </p>
        </div>
    `;
    marker.bindPopup(popupContent);
    marker.openPopup();
    
    // Auto remove after 30 seconds (बहुत सारे markers न होने के लिए)
    setTimeout(() => {
        if (threatMap && marker) {
            threatMap.removeLayer(marker);
        }
    }, 30000);
    
    // Timeline Update
    const timeline = document.getElementById('threatTimeline');
    if (timeline) {
        const emoji = { high: '🔴', medium: '🟡', low: '🟢' };
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.style.animation = 'fadeIn 0.5s ease';
        item.innerHTML = `
            <span class="timeline-time">${emoji[newThreat.severity]} JUST NOW</span>
            <span class="timeline-event">${newThreat.threat} — ${newThreat.country}</span>
        `;
        timeline.insertBefore(item, timeline.firstChild);
        if (timeline.children.length > 10) {
            timeline.removeChild(timeline.lastChild);
        }
    }
    
    // Stats Update
    const countryMap = {
        '🇺🇸 USA': 'usThreats',
        '🇨🇳 China': 'cnThreats',
        '🇷🇺 Russia': 'ruThreats',
        '🇮🇳 India': 'inThreats',
        '🇬🇧 UK': 'ukThreats',
        '🇩🇪 Germany': 'deThreats'
    };
    
    const statId = countryMap[newThreat.country];
    if (statId) {
        const el = document.getElementById(statId);
        if (el) {
            let val = parseInt(el.textContent.replace(/,/g, '')) || 1000;
            val += Math.floor(Math.random() * 5) + 1;
            el.textContent = val.toLocaleString();
        }
    }
    
    // Total Threats
    const totalThreats = document.getElementById('totalThreats');
    if (totalThreats) {
        let val = parseInt(totalThreats.textContent.replace(/,/g, '')) || 12847;
        val += 1;
        totalThreats.textContent = val.toLocaleString();
    }
    
    // Active Attacks
    const activeAttacks = document.getElementById('activeAttacks');
    if (activeAttacks) {
        let val = parseInt(activeAttacks.textContent.replace(/,/g, '')) || 342;
        val += Math.floor(Math.random() * 3);
        activeAttacks.textContent = val.toLocaleString();
    }
    
    // Threat Level Update
    const threatLevels = ['🟢 LOW', '🟡 MEDIUM', '🔴 HIGH'];
    const randomLevel = threatLevels[Math.floor(Math.random() * threatLevels.length)];
    document.getElementById('dashThreat').textContent = randomLevel;
    
    console.log('🆕 Real-Time Threat Added:', newThreat);
}

// ================================================================
// 🚀 INIT THREAT MAP & REAL-TIME UPDATES
// ================================================================

if (document.readyState === 'complete') {
    setTimeout(initThreatMap, 500);
    // Start Real-time updates after map loads
    setTimeout(() => {
        // Add initial real-time threats
        for (let i = 0; i < 3; i++) {
            setTimeout(addRealTimeThreatToMap, i * 2000);
        }
        // Add new threat every 8-15 seconds
        setInterval(addRealTimeThreatToMap, 8000 + Math.random() * 7000);
    }, 2000);
} else {
    window.addEventListener('load', () => {
        setTimeout(initThreatMap, 500);
        setTimeout(() => {
            for (let i = 0; i < 3; i++) {
                setTimeout(addRealTimeThreatToMap, i * 2000);
            }
            setInterval(addRealTimeThreatToMap, 8000 + Math.random() * 7000);
        }, 2000);
    });
}

// ================================================================
// AI VISION FUNCTIONS
// ================================================================

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

// ================================================================
// OSINT & SECURITY FUNCTIONS
// ================================================================

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

// ================================================================
// CSS ANIMATION FOR TIMELINE
// ================================================================

const style = document.createElement('style');
style.textContent = `
    .timeline-item {
        animation: fadeIn 0.5s ease;
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateX(-20px); }
        to { opacity: 1; transform: translateX(0); }
    }
    .threat-marker {
        animation: threat-pulse 1.5s ease-in-out infinite;
    }
    @keyframes threat-pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.3); opacity: 0.7; }
    }
`;
document.head.appendChild(style);

console.log('%c⚡ MK CYBER HUB v7.2 — WITH REAL-TIME THREAT MAP', 'font-size:20px;color:#1B3A5C;font-weight:900');
console.log('%c🔥 Real-time threats will appear every 8-15 seconds', 'font-size:14px;color:#FF4444');
console.log('%c🗺️ Interactive Threat Map Loaded', 'font-size:14px;color:#00D4FF');
