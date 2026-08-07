// ================================================================
// 🐍 MK CYBER HUB - Frontend JavaScript (Updated)
// ================================================================

// ===== GLOBALS =====
let model = null;
let stream = null;
let running = false;
let interval = null;
let threatMap = null;
let currentUser = 'default';
let voiceRecognition = null;

// ================================================================
// 🌙 THEME
// ================================================================

function toggleTheme() {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
}

if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
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
// 🌍 MULTI-LANGUAGE
// ================================================================

async function changeLanguage(lang) {
    try {
        const response = await fetch(`/api/language/${lang}`);
        const data = await response.json();
        
        // Update UI with translations
        document.querySelectorAll('[data-lang]').forEach(el => {
            const key = el.getAttribute('data-lang');
            if (data[key]) {
                el.textContent = data[key];
            }
        });
        
        localStorage.setItem('language', lang);
    } catch (e) {
        console.log('Language error:', e);
    }
}

// Load saved language
const savedLang = localStorage.getItem('language') || 'en';
document.getElementById('languageSelect').value = savedLang;
changeLanguage(savedLang);

// ================================================================
// 🗣️ VOICE COMMANDS
// ================================================================

function toggleVoiceMode() {
    if (!voiceRecognition) {
        initVoiceRecognition();
    }
    
    if (voiceRecognition && !voiceRecognition.isListening) {
        voiceRecognition.start();
        document.getElementById('voiceBtn').style.color = '#00D4FF';
        document.getElementById('voiceBtn').innerHTML = '<i class="fas fa-microphone"></i> 🎤';
    } else if (voiceRecognition) {
        voiceRecognition.stop();
        document.getElementById('voiceBtn').style.color = '';
        document.getElementById('voiceBtn').innerHTML = '<i class="fas fa-microphone"></i>';
    }
}

function initVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Voice recognition not supported in this browser. Use Chrome.');
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    voiceRecognition = new SpeechRecognition();
    voiceRecognition.lang = 'en-US';
    voiceRecognition.continuous = true;
    voiceRecognition.interimResults = true;
    voiceRecognition.isListening = false;
    
    voiceRecognition.onstart = function() {
        this.isListening = true;
        console.log('🎤 Voice recognition started');
    };
    
    voiceRecognition.onerror = function(event) {
        console.log('🎤 Error:', event.error);
        this.isListening = false;
        document.getElementById('voiceBtn').style.color = '';
        document.getElementById('voiceBtn').innerHTML = '<i class="fas fa-microphone"></i>';
    };
    
    voiceRecognition.onend = function() {
        this.isListening = false;
        document.getElementById('voiceBtn').style.color = '';
        document.getElementById('voiceBtn').innerHTML = '<i class="fas fa-microphone"></i>';
    };
    
    voiceRecognition.onresult = async function(event) {
        const last = event.results.length - 1;
        const command = event.results[last][0].transcript;
        console.log('🎤 Command:', command);
        
        try {
            const response = await fetch('/api/voice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: command })
            });
            const data = await response.json();
            
            // Execute action
            if (data.action === 'map_zoom' && threatMap && data.data) {
                threatMap.setView([data.data.lat, data.data.lng], data.data.zoom);
                alert('🗺️ ' + data.message);
            } else if (data.action === 'scan') {
                startScanner();
            } else if (data.action === 'stop') {
                stopScanner();
            } else if (data.action === 'capture') {
                captureFrame();
            } else if (data.action === 'dark_mode') {
                toggleTheme();
                document.body.classList.add('dark');
            } else if (data.action === 'light_mode') {
                toggleTheme();
                document.body.classList.remove('dark');
            } else if (data.action === 'export') {
                exportData('csv');
            }
            
        } catch (e) {
            console.log('Voice command error:', e);
        }
    };
}

// ================================================================
// 📊 FETCH STATS
// ================================================================

async function fetchStats() {
    try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        document.getElementById('totalThreats').textContent = data.total_threats.toLocaleString();
        document.getElementById('activeAttacks').textContent = data.active_attacks.toLocaleString();
        document.getElementById('vulnerabilities').textContent = data.vulnerabilities.toLocaleString();
        document.getElementById('countries').textContent = data.countries.toLocaleString();
    } catch (e) { console.log('Stats fetch error'); }
}

async function fetchCountryStats() {
    try {
        const response = await fetch('/api/country-stats');
        const data = await response.json();
        document.getElementById('usThreats').textContent = data.us.toLocaleString();
        document.getElementById('cnThreats').textContent = data.cn.toLocaleString();
        document.getElementById('ruThreats').textContent = data.ru.toLocaleString();
        document.getElementById('inThreats').textContent = data.in.toLocaleString();
        document.getElementById('ukThreats').textContent = data.uk.toLocaleString();
        document.getElementById('deThreats').textContent = data.de.toLocaleString();
    } catch (e) { console.log('Country stats fetch error'); }
}

async function fetchNews() {
    try {
        const response = await fetch('/api/news');
        const data = await response.json();
        document.getElementById('newsTicker').innerHTML = `<span>🚨 ${data.news}</span>`;
    } catch (e) { console.log('News fetch error'); }
}

// Update every 10 seconds
setInterval(fetchStats, 10000);
setInterval(fetchCountryStats, 10000);
setInterval(fetchNews, 30000);

fetchStats();
fetchCountryStats();
fetchNews();

// ================================================================
// 🎮 GAMIFICATION
// ================================================================

async function updateGamification() {
    try {
        const response = await fetch(`/api/gamification/${currentUser}`);
        const data = await response.json();
        document.getElementById('userPoints').textContent = data.points;
        document.getElementById('userLevel').textContent = data.level;
        document.getElementById('userScans').textContent = data.scans;
        document.getElementById('userBadges').textContent = data.badges.join(', ') || 'None';
    } catch (e) { console.log('Gamification error:', e); }
}

updateGamification();

async function addGamificationPoints(points, action) {
    try {
        const response = await fetch('/api/gamification/add-points', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: currentUser, points: points, action: action })
        });
        const data = await response.json();
        updateGamification();
        return data;
    } catch (e) { console.log('Add points error:', e); }
}

// ================================================================
// 🔮 AI PREDICTOR
// ================================================================

async function loadPredictions() {
    try {
        const response = await fetch('/api/predict');
        const data = await response.json();
        const container = document.getElementById('predictionsContainer');
        
        if (data.predictions && data.predictions.length > 0) {
            container.innerHTML = data.predictions.map(p => `
                <div class="prediction-card">
                    <div class="prediction-header">
                        <span class="prediction-country">${p.country}</span>
                        <span class="prediction-severity">${p.severity}</span>
                    </div>
                    <div class="prediction-body">
                        <strong>⚡ ${p.attack}</strong>
                        <div class="prediction-probability">
                            <span>Probability: ${p.probability}%</span>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width:${p.probability}%;background:${p.probability > 70 ? '#FF4444' : p.probability > 50 ? '#FFAA00' : '#44DD88'};"></div>
                            </div>
                        </div>
                        <div class="prediction-time">⏰ ${p.timeframe}</div>
                        <div class="prediction-prevention">🛡️ ${p.prevention}</div>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p>No predictions available</p>';
        }
    } catch (e) {
        console.log('Predictions error:', e);
        document.getElementById('predictionsContainer').innerHTML = '<p>⚠️ Could not load predictions</p>';
    }
}

setTimeout(loadPredictions, 1000);
setInterval(loadPredictions, 30000);

// ================================================================
// 🕵️ DARK WEB SENTIMENT
// ================================================================

async function checkDarkWebSentiment() {
    const input = document.getElementById('sentimentInput');
    const keyword = input.value.trim();
    
    if (!keyword) {
        alert('Please enter a keyword to monitor');
        return;
    }
    
    const container = document.getElementById('sentimentResults');
    container.innerHTML = '<p>🔍 Analyzing dark web...</p>';
    
    try {
        const response = await fetch('/api/dark-web-sentiment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keyword: keyword })
        });
        const data = await response.json();
        
        if (data.results) {
            container.innerHTML = `
                <div class="sentiment-summary">
                    <h4>📊 Results for "${data.keyword}"</h4>
                    <p>Total Mentions: ${data.total_mentions}</p>
                    <p>Average Score: ${data.average_score.toFixed(0)}%</p>
                </div>
                <div class="sentiment-grid">
                    ${data.results.map(r => `
                        <div class="sentiment-item">
                            <span class="platform">${r.platform}</span>
                            <span class="sentiment">${r.sentiment}</span>
                            <span class="score">${r.score}%</span>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            container.innerHTML = '<p>No results found</p>';
        }
    } catch (e) {
        container.innerHTML = '<p>❌ Error analyzing dark web</p>';
    }
}

// ================================================================
// 🤖 DIGITAL TWIN
// ================================================================

async function sendTwinMessage() {
    const input = document.getElementById('twinInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    const chat = document.getElementById('twinChat');
    
    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'twin-message twin-user';
    userMsg.textContent = '👤 ' + message;
    chat.appendChild(userMsg);
    
    input.value = '';
    chat.scrollTop = chat.scrollHeight;
    
    // Add loading indicator
    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'twin-message twin-ai';
    loadingMsg.textContent = '🤖 Thinking...';
    chat.appendChild(loadingMsg);
    chat.scrollTop = chat.scrollHeight;
    
    try {
        const response = await fetch('/api/digital-twin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message })
        });
        const data = await response.json();
        
        // Remove loading message
        chat.removeChild(loadingMsg);
        
        // Add AI response
        const aiMsg = document.createElement('div');
        aiMsg.className = 'twin-message twin-ai';
        aiMsg.textContent = data.response;
        chat.appendChild(aiMsg);
        
        // If threat analysis included
        if (data.threat_analysis) {
            const threatMsg = document.createElement('div');
            threatMsg.className = 'twin-message twin-threat';
            threatMsg.innerHTML = `
                <strong>📊 Threat Analysis:</strong><br>
                Risk Score: ${data.threat_analysis.risk_score}%<br>
                Action: ${data.threat_analysis.action}
            `;
            chat.appendChild(threatMsg);
        }
        
        chat.scrollTop = chat.scrollHeight;
        
    } catch (e) {
        chat.removeChild(loadingMsg);
        const errorMsg = document.createElement('div');
        errorMsg.className = 'twin-message twin-ai';
        errorMsg.textContent = '🤖 Sorry, I encountered an error. Please try again.';
        chat.appendChild(errorMsg);
    }
}

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
                html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 20px ${color};"></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });

            const marker = L.marker([loc.lat, loc.lng], { icon: icon }).addTo(threatMap);
            marker.bindPopup(`
                <b>${loc.country}</b><br>
                ${loc.city}<br>
                ⚡ ${loc.threat}<br>
                <small>${loc.severity.toUpperCase()} RISK</small>
            `);
        });

        const group = L.featureGroup(threatMap._layers);
        threatMap.fitBounds(group.getBounds().pad(0.1));

        window.addEventListener('resize', () => {
            if (threatMap) setTimeout(() => threatMap.invalidateSize(), 300);
        });

    } catch (e) {
        console.log('Map error:', e);
    }
}

setTimeout(initThreatMap, 500);

// ================================================================
// 🎯 AI VISION
// ================================================================

async function loadModel() {
    try {
        if (typeof cocoSsd !== 'undefined') {
            model = await cocoSsd.load();
            document.getElementById('detectedAI').textContent = '🧠 AI READY';
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
            status.innerHTML = '⏳ LOADING AI...';
            await loadModel();
            if (!model) {
                status.innerHTML = '❌ AI FAILED';
                return;
            }
        }

        if (stream) {
            stream.getTracks().forEach(t => t.stop());
            stream = null;
        }

        status.innerHTML = '📷 CAMERA...';
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
            audio: false
        });

        video.srcObject = stream;
        await video.play();

        running = true;
        status.innerHTML = '<span class="dot"></span> LIVE SCANNING';
        document.getElementById('visionStatus').textContent = '🟢 LIVE';

        startDetectionLoop();

        // Add gamification points
        addGamificationPoints(5, 'scan_start');

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

                if (filtered.length > 0) {
                    filtered.forEach(p => {
                        ctx.strokeStyle = '#00D4FF';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(p.bbox[0], p.bbox[1], p.bbox[2], p.bbox[3]);

                        const label = p.class.toUpperCase() + ' (' + Math.round(p.score * 100) + '%)';
                        ctx.font = '12px Inter, sans-serif';
                        const metrics = ctx.measureText(label);
                        ctx.fillStyle = 'rgba(0,0,0,0.7)';
                        ctx.fillRect(p.bbox[0] - 2, p.bbox[1] - 22, metrics.width + 14, 22);
                        ctx.fillStyle = '#00D4FF';
                        ctx.fillText(label, p.bbox[0] + 4, p.bbox[1] - 4);
                    });

                    const top = filtered[0];
                    const confidence = Math.round(top.score * 100);
                    document.getElementById('detectedObject').textContent = '🔍 ' + top.class.toUpperCase();
                    document.getElementById('detectedConfidence').textContent = 'CONFIDENCE: ' + confidence + '%';
                    document.getElementById('confidence').textContent = confidence + '%';

                    if (top.class === 'person') {
                        document.getElementById('threatLevel').textContent = '🟡 MEDIUM';
                    }

                } else {
                    document.getElementById('detectedObject').textContent = '🔍 NO OBJECT';
                    document.getElementById('detectedConfidence').textContent = 'CONFIDENCE: --%';
                }

            } catch (e) {
                console.log('Detection error:', e);
            }
        }

    }, 150);
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
    document.getElementById('visionStatus').textContent = '⏸️ PAUSED';
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
    document.getElementById('scanStatus').textContent = '✅ COMPLETE';

    const obj = document.getElementById('detectedObject').textContent.replace('🔍 ', '');
    const conf = document.getElementById('detectedConfidence').textContent.replace('CONFIDENCE: ', '');
    
    document.getElementById('scanObjectName').textContent = obj;
    document.getElementById('scanConfidence').textContent = conf;
    document.getElementById('scanCategory').textContent = 'DETECTED';
    document.getElementById('scanDescription').textContent = 'Object detected by AI vision engine.';

    // Add gamification points
    addGamificationPoints(10, 'capture');
}

function setVisionMode(mode) {
    document.querySelectorAll('.vision-modes .mode').forEach(b => b.classList.remove('active'));
    const map = { object: 'modeObject', threat: 'modeThreat', all: 'modeAll' };
    if (map[mode]) {
        document.getElementById(map[mode]).classList.add('active');
    }
    document.getElementById('detectedAI').textContent = '🧠 ' + mode.toUpperCase();
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
            result.innerHTML = `✅ ${data.message || data.results || 'Analysis complete'}`;
            result.className = 'result success';
        } else {
            result.innerHTML = '❌ Error scanning';
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
        'threat': { input: 'threatInput', result: 'threatResult', url: '/api/security/threat-analyze' },
        'ssl': { input: 'sslInput', result: 'sslResult', url: '/api/security/ssl-check' },
        'phish': { input: 'phishInput', result: 'phishResult', url: '/api/security/phishing-detect' },
        'ip': { input: 'ipInput', result: 'ipResult', url: '/api/security/ip-reputation' }
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
            result.innerHTML = `✅ ${data.risk_level || data.reputation || 'Analysis complete'}`;
            result.className = 'result success';
        } else {
            result.innerHTML = '❌ Error analyzing';
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
                plugins: { legend: { display: false } },
                scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,0.04)' } } }
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
// 🔄 REAL-TIME TIMELINE
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

console.log('%c🐍 MK CYBER HUB v8.0 - COMPLETE UPDATE', 'font-size:20px;color:#1B3A5C;font-weight:900');
console.log('%c⚡ New Features: Voice Commands, 100+ Languages, Digital Twin, Dark Web Sentiment, AI Predictor, Gamification', 'font-size:14px;color:#00D4FF');
console.log('%c✅ All Systems Active', 'font-size:14px;color:#44DD88');

// Load model
setTimeout(loadModel, 1000);
