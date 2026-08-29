// ================================================================
// 🐍 MK CYBER HUB - WORKING SCANNER
// ================================================================

let model = null;
let stream = null;
let running = false;
let interval = null;

// ===== CLOCK =====
function updateClock() {
    const now = new Date();
    const el = document.getElementById('currentTime');
    if (el) {
        el.textContent = String(now.getHours()).padStart(2, '0') + ':' +
                         String(now.getMinutes()).padStart(2, '0') + ':' +
                         String(now.getSeconds()).padStart(2, '0');
    }
}
updateClock();
setInterval(updateClock, 1000);

// ===== FETCH STATS =====
async function fetchStats() {
    try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        const ids = ['totalThreats', 'activeAttacks', 'vulnerabilities', 'countries'];
        const vals = [data.threats, data.attacks, data.vulnerabilities, data.countries];
        ids.forEach((id, i) => {
            const el = document.getElementById(id);
            if (el) el.textContent = vals[i]?.toLocaleString() || '0';
        });
    } catch (e) {}
}

async function fetchNews() {
    try {
        const res = await fetch('/api/news');
        const data = await res.json();
        const el = document.getElementById('newsTicker');
        if (el) el.innerHTML = `<span>🚨 ${data.news}</span>`;
    } catch (e) {}
}

fetchStats();
fetchNews();
setInterval(fetchStats, 15000);
setInterval(fetchNews, 30000);

// ===== LOAD MODEL =====
async function loadModel() {
    try {
        const status = document.getElementById('aiStatus');
        if (status) status.textContent = 'Loading...';
        
        if (typeof cocoSsd !== 'undefined') {
            model = await cocoSsd.load();
            if (status) status.textContent = '✅ Ready (80+ Objects)';
            console.log('✅ COCO-SSD Loaded');
            return true;
        }
        if (status) status.textContent = '❌ Failed';
        return false;
    } catch (e) {
        const status = document.getElementById('aiStatus');
        if (status) status.textContent = '❌ Error';
        console.error('Model load error:', e);
        return false;
    }
}

// ===== START SCANNER =====
async function startScanner() {
    const video = document.getElementById('video');
    const status = document.getElementById('cameraStatus');

    try {
        if (!model) {
            if (status) status.innerHTML = '⏳ LOADING AI...';
            await loadModel();
            if (!model) {
                if (status) status.innerHTML = '❌ AI FAILED';
                return;
            }
        }

        if (stream) {
            stream.getTracks().forEach(t => t.stop());
            stream = null;
        }

        if (status) status.innerHTML = '📷 CAMERA...';
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
            audio: false
        });

        video.srcObject = stream;
        await video.play();

        running = true;
        if (status) status.innerHTML = '<span class="dot"></span> LIVE SCANNING';
        startDetectionLoop();

    } catch (e) {
        if (status) status.innerHTML = '❌ ' + e.message;
        console.error('Camera error:', e);
    }
}

// ===== DETECTION LOOP =====
function startDetectionLoop() {
    if (interval) clearInterval(interval);

    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    let frameCount = 0;
    let lastFpsTime = Date.now();

    interval = setInterval(async () => {
        if (!running || !video || video.paused) return;
        if (video.videoWidth === 0) return;

        const w = video.videoWidth;
        const h = video.videoHeight;
        canvas.width = w;
        canvas.height = h;
        ctx.clearRect(0, 0, w, h);

        // FPS
        frameCount++;
        if (Date.now() - lastFpsTime > 1000) {
            const fpsEl = document.getElementById('fps');
            if (fpsEl) fpsEl.textContent = frameCount;
            frameCount = 0;
            lastFpsTime = Date.now();
        }

        if (model) {
            try {
                const predictions = await model.detect(video);
                const filtered = predictions.filter(p => p.score > 0.35);

                const objCount = document.getElementById('objCount');
                if (objCount) objCount.textContent = filtered.length;

                if (filtered.length > 0) {
                    filtered.forEach(p => {
                        // Box
                        ctx.strokeStyle = '#00D4FF';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(p.bbox[0], p.bbox[1], p.bbox[2], p.bbox[3]);

                        // Label
                        const label = p.class.toUpperCase() + ' (' + Math.round(p.score * 100) + '%)';
                        ctx.font = 'bold 13px Inter, sans-serif';
                        const metrics = ctx.measureText(label);
                        ctx.fillStyle = 'rgba(0,0,0,0.75)';
                        ctx.fillRect(p.bbox[0] - 2, p.bbox[1] - 26, metrics.width + 18, 26);
                        ctx.fillStyle = '#00D4FF';
                        ctx.fillText(label, p.bbox[0] + 4, p.bbox[1] - 6);
                    });

                    // Update UI
                    const top = filtered[0];
                    const confidence = Math.round(top.score * 100);
                    
                    const detectedEl = document.getElementById('detectedObject');
                    if (detectedEl) detectedEl.textContent = '🔍 ' + top.class.toUpperCase();
                    
                    const confEl = document.getElementById('detectedConfidence');
                    if (confEl) confEl.textContent = 'Conf: ' + confidence + '%';
                    
                    const confDash = document.getElementById('confidence');
                    if (confDash) confDash.textContent = confidence + '%';

                } else {
                    const detectedEl = document.getElementById('detectedObject');
                    if (detectedEl) detectedEl.textContent = '🔍 No Object';
                    
                    const confEl = document.getElementById('detectedConfidence');
                    if (confEl) confEl.textContent = 'Conf: --%';
                    
                    const confDash = document.getElementById('confidence');
                    if (confDash) confDash.textContent = '--%';
                }

            } catch (e) {
                console.error('Detection error:', e);
            }
        }

    }, 200);
}

// ===== STOP SCANNER =====
function stopScanner() {
    running = false;
    if (interval) {
        clearInterval(interval);
        interval = null;
    }
    if (stream) {
        stream.getTracks().forEach(t => t.stop());
        stream = null;
    }
    const video = document.getElementById('video');
    if (video) {
        video.srcObject = null;
        video.pause();
    }
    const status = document.getElementById('cameraStatus');
    if (status) status.innerHTML = '<span class="dot"></span> STOPPED';
}

// ===== SWITCH CAMERA =====
function switchCamera() {
    if (running) {
        stopScanner();
        setTimeout(startScanner, 500);
    }
}

// ===== OSINT FUNCTIONS =====
async function runDork() {
    const input = document.getElementById('dorkInput');
    const result = document.getElementById('dorkResult');
    const query = input ? input.value.trim() : 'example';
    if (result) {
        result.innerHTML = '🔍 SCANNING...';
        result.className = 'result';
    }
    try {
        const res = await fetch('/api/osint/dork', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query })
        });
        const data = await res.json();
        if (result) {
            result.innerHTML = `✅ ${data.message}`;
            result.className = 'result success';
        }
    } catch (e) {
        if (result) {
            result.innerHTML = '❌ Error';
            result.className = 'result error';
        }
    }
}

async function runShodan() {
    const input = document.getElementById('shodanInput');
    const result = document.getElementById('shodanResult');
    const query = input ? input.value.trim() : 'example';
    if (result) {
        result.innerHTML = '🌐 SCANNING...';
        result.className = 'result';
    }
    try {
        const res = await fetch('/api/osint/shodan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query })
        });
        const data = await res.json();
        if (result) {
            result.innerHTML = `✅ ${data.message}`;
            result.className = 'result success';
        }
    } catch (e) {
        if (result) {
            result.innerHTML = '❌ Error';
            result.className = 'result error';
        }
    }
}

// ===== SECURITY FUNCTIONS =====
async function runThreat() {
    const input = document.getElementById('threatInput');
    const result = document.getElementById('threatResult');
    const query = input ? input.value.trim() : 'target';
    if (result) {
        result.innerHTML = '🛡️ ANALYZING...';
        result.className = 'result';
    }
    try {
        const res = await fetch('/api/security/threat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target: query })
        });
        const data = await res.json();
        if (result) {
            result.innerHTML = `✅ ${data.message}`;
            result.className = 'result success';
        }
    } catch (e) {
        if (result) {
            result.innerHTML = '❌ Error';
            result.className = 'result error';
        }
    }
}

async function runSSL() {
    const input = document.getElementById('sslInput');
    const result = document.getElementById('sslResult');
    const query = input ? input.value.trim() : 'example.com';
    if (result) {
        result.innerHTML = '🔒 CHECKING...';
        result.className = 'result';
    }
    try {
        const res = await fetch('/api/security/ssl', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ domain: query })
        });
        const data = await res.json();
        if (result) {
            result.innerHTML = `✅ ${data.message}`;
            result.className = 'result success';
        }
    } catch (e) {
        if (result) {
            result.innerHTML = '❌ Error';
            result.className = 'result error';
        }
    }
}

// ===== INIT =====
console.log('%c⚡ MK CYBER HUB v8.3 - WORKING', 'font-size:20px;color:#00D4FF;font-weight:900');
setTimeout(loadModel, 1000);
