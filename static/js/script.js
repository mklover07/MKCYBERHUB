// ================================================================
// 🐍 MK CYBER HUB - WORKING SCANNER
// ================================================================

// ===== GLOBALS =====
let model = null;
let stream = null;
let running = false;
let interval = null;

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

async function fetchNews() {
    try {
        const res = await fetch('/api/news');
        const data = await res.json();
        document.getElementById('newsTicker').innerHTML = `<span>🚨 ${data.news}</span>`;
    } catch (e) {}
}

fetchStats();
fetchNews();
setInterval(fetchStats, 15000);
setInterval(fetchNews, 30000);

// ================================================================
// 🎯 AI VISION - WORKING
// ================================================================

async function loadModel() {
    try {
        document.getElementById('aiStatus').textContent = 'Loading...';
        if (typeof cocoSsd !== 'undefined') {
            model = await cocoSsd.load();
            document.getElementById('aiStatus').textContent = '✅ Ready';
            console.log('✅ COCO-SSD Loaded');
            return true;
        }
        document.getElementById('aiStatus').textContent = '❌ Failed';
        return false;
    } catch (e) {
        document.getElementById('aiStatus').textContent = '❌ Error';
        console.error('Model load error:', e);
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
        status.innerHTML = '<span class="dot"></span> LIVE';
        startDetectionLoop();

    } catch (e) {
        status.innerHTML = '❌ ' + e.message;
        console.error('Camera error:', e);
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
                const filtered = predictions.filter(p => p.score > 0.4);

                document.getElementById('objCount').textContent = filtered.length;

                if (filtered.length > 0) {
                    filtered.forEach(p => {
                        ctx.strokeStyle = '#00D4FF';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(p.bbox[0], p.bbox[1], p.bbox[2], p.bbox[3]);

                        const label = p.class.toUpperCase() + ' (' + Math.round(p.score * 100) + '%)';
                        ctx.font = 'bold 12px Inter, sans-serif';
                        const metrics = ctx.measureText(label);
                        ctx.fillStyle = 'rgba(0,0,0,0.7)';
                        ctx.fillRect(p.bbox[0] - 2, p.bbox[1] - 22, metrics.width + 16, 22);
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
                    document.getElementById('confidence').textContent = '--%';
                }

            } catch (e) {
                console.error('Detection error:', e);
            }
        }

    }, 200);
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

// ================================================================
// 🔍 OSINT FUNCTIONS
// ================================================================

async function runOSINT(tool) {
    const configs = {
        'dork': { input: 'dorkInput', result: 'dorkResult', url: '/api/osint/dork' },
        'shodan': { input: 'shodanInput', result: 'shodanResult', url: '/api/osint/shodan' }
    };
    const config = configs[tool];
    if (!config) return;

    const input = document.getElementById(config.input);
    const result = document.getElementById(config.result);
    const query = input.value.trim() || 'example';

    result.innerHTML = '🔍 SCANNING...';
    result.className = 'result';

    try {
        const res = await fetch(config.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query })
        });
        const data = await res.json();
        if (data.status === 'success') {
            result.innerHTML = `✅ ${data.message || 'Complete'}`;
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
    const configs = {
        'threat': { input: 'threatInput', result: 'threatResult', url: '/api/security/threat' },
        'ssl': { input: 'sslInput', result: 'sslResult', url: '/api/security/ssl' }
    };
    const config = configs[tool];
    if (!config) return;

    const input = document.getElementById(config.input);
    const result = document.getElementById(config.result);
    const query = input.value.trim() || 'target';

    result.innerHTML = '🛡️ ANALYZING...';
    result.className = 'result';

    try {
        const res = await fetch(config.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target: query, domain: query })
        });
        const data = await res.json();
        if (data.status === 'success') {
            result.innerHTML = `✅ ${data.message || 'Complete'}`;
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
// 🚀 INIT
// ================================================================

console.log('%c⚡ MK CYBER HUB v8.2 - WORKING', 'font-size:20px;color:#00D4FF;font-weight:900');
console.log('📸 Click START AI to begin scanning');

setTimeout(loadModel, 1000);
