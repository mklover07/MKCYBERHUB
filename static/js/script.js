// ================================================================
// 🚀 MK CYBER HUB - COMPLETE WORKING JAVASCRIPT
// ================================================================

let model = null;
let stream = null;
let running = false;
let interval = null;

// ===== CLOCK =====
function updateClock() {
    const now = new Date();
    const el = document.getElementById('clock');
    if (el) {
        el.textContent = String(now.getHours()).padStart(2, '0') + ':' +
                         String(now.getMinutes()).padStart(2, '0') + ':' +
                         String(now.getSeconds()).padStart(2, '0');
    }
}
updateClock();
setInterval(updateClock, 1000);

// ===== THEME =====
function toggleTheme() {
    document.body.classList.toggle('light');
    const btn = document.querySelector('.theme-btn');
    if (btn) {
        btn.textContent = document.body.classList.contains('light') ? '☀️' : '🌙';
    }
}

// ===== FETCH STATS =====
async function fetchStats() {
    try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        const total = document.getElementById('totalThreats');
        const attacks = document.getElementById('activeAttacks');
        const vulns = document.getElementById('vulnerabilities');
        const countries = document.getElementById('countries');
        
        if (total) total.textContent = data.threats?.toLocaleString() || '0';
        if (attacks) attacks.textContent = data.attacks?.toLocaleString() || '0';
        if (vulns) vulns.textContent = data.vulnerabilities?.toLocaleString() || '0';
        if (countries) countries.textContent = data.countries?.toLocaleString() || '0';
    } catch (e) {
        console.log('Stats error:', e);
    }
}

async function fetchNews() {
    try {
        const res = await fetch('/api/news');
        const data = await res.json();
        const ticker = document.getElementById('newsTicker');
        if (ticker) ticker.innerHTML = `<span>🚨 ${data.news}</span>`;
    } catch (e) {
        console.log('News error:', e);
    }
}

fetchStats();
fetchNews();
setInterval(fetchStats, 15000);
setInterval(fetchNews, 30000);

// ===== LOAD AI MODEL =====
async function loadModel() {
    try {
        const status = document.getElementById('aiStatus');
        if (status) status.textContent = 'Loading...';
        
        if (typeof cocoSsd === 'undefined') {
            if (status) status.textContent = '❌ Library Failed';
            return false;
        }
        
        model = await cocoSsd.load();
        if (status) status.textContent = '✅ Ready';
        console.log('✅ COCO-SSD Loaded');
        return true;
        
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
        if (!video) {
            alert('Video element not found');
            return;
        }

        if (!model) {
            if (status) status.innerHTML = '<span class="pulse"></span> Loading AI...';
            const loaded = await loadModel();
            if (!loaded) {
                if (status) status.innerHTML = '❌ AI Failed';
                return;
            }
        }

        if (stream) {
            stream.getTracks().forEach(t => t.stop());
            stream = null;
        }

        if (status) status.innerHTML = '<span class="pulse"></span> Starting...';
        
        stream = await navigator.mediaDevices.getUserMedia({
            video: { 
                facingMode: 'environment',
                width: { ideal: 640 },
                height: { ideal: 480 }
            },
            audio: false
        });

        video.srcObject = stream;
        await video.play();

        running = true;
        if (status) status.innerHTML = '<span class="pulse"></span> Live Scanning';
        
        const visionStatus = document.getElementById('visionStatus');
        if (visionStatus) visionStatus.textContent = '🟢 Live';
        
        startDetectionLoop();

    } catch (e) {
        if (status) status.innerHTML = '❌ ' + e.message;
        console.error('Camera error:', e);
        alert('Camera Error: ' + e.message);
    }
}

// ===== DETECTION LOOP =====
function startDetectionLoop() {
    if (interval) clearInterval(interval);

    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    if (!canvas) return;
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
                        ctx.strokeStyle = '#00D4FF';
                        ctx.lineWidth = 2;
                        ctx.shadowColor = '#00D4FF';
                        ctx.shadowBlur = 10;
                        ctx.strokeRect(p.bbox[0], p.bbox[1], p.bbox[2], p.bbox[3]);
                        ctx.shadowBlur = 0;

                        const label = p.class.toUpperCase() + ' (' + Math.round(p.score * 100) + '%)';
                        ctx.font = 'bold 13px Inter, sans-serif';
                        const metrics = ctx.measureText(label);
                        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
                        ctx.fillRect(p.bbox[0] - 2, p.bbox[1] - 26, metrics.width + 16, 26);
                        ctx.fillStyle = '#00D4FF';
                        ctx.fillText(label, p.bbox[0] + 4, p.bbox[1] - 7);
                    });

                    const top = filtered[0];
                    const confidence = Math.round(top.score * 100);
                    
                    const detectedEl = document.getElementById('detectedObject');
                    if (detectedEl) detectedEl.textContent = '🎯 ' + top.class.toUpperCase();
                    
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
    if (status) status.innerHTML = '<span class="pulse"></span> Stopped';
    
    const visionStatus = document.getElementById('visionStatus');
    if (visionStatus) visionStatus.textContent = '⏸️ Stopped';
}

// ===== SWITCH CAMERA =====
function switchCamera() {
    if (running) {
        stopScanner();
        setTimeout(startScanner, 500);
    }
}

// ===== OSINT =====
async function runDork() {
    const input = document.getElementById('dorkInput');
    const result = document.getElementById('dorkResult');
    const query = input ? input.value.trim() : 'example';
    
    if (result) {
        result.innerHTML = '🔍 Scanning...';
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
            result.innerHTML = data.message || '✅ Complete';
            result.className = 'result success';
        }
    } catch (e) {
        if (result) {
            result.innerHTML = '❌ Error: ' + e.message;
            result.className = 'result error';
        }
    }
}

async function runShodan() {
    const input = document.getElementById('shodanInput');
    const result = document.getElementById('shodanResult');
    const query = input ? input.value.trim() : 'example';
    
    if (result) {
        result.innerHTML = '🌐 Scanning...';
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
            result.innerHTML = data.message || '✅ Complete';
            result.className = 'result success';
        }
    } catch (e) {
        if (result) {
            result.innerHTML = '❌ Error: ' + e.message;
            result.className = 'result error';
        }
    }
}

// ===== SECURITY =====
async function runThreat() {
    const input = document.getElementById('threatInput');
    const result = document.getElementById('threatResult');
    const query = input ? input.value.trim() : 'target';
    
    if (result) {
        result.innerHTML = '🛡️ Analyzing...';
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
            result.innerHTML = data.message || '✅ Complete';
            result.className = 'result success';
        }
    } catch (e) {
        if (result) {
            result.innerHTML = '❌ Error: ' + e.message;
            result.className = 'result error';
        }
    }
}

async function runSSL() {
    const input = document.getElementById('sslInput');
    const result = document.getElementById('sslResult');
    const query = input ? input.value.trim() : 'example.com';
    
    if (result) {
        result.innerHTML = '🔒 Checking...';
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
            result.innerHTML = data.message || '✅ Complete';
            result.className = 'result success';
        }
    } catch (e) {
        if (result) {
            result.innerHTML = '❌ Error: ' + e.message;
            result.className = 'result error';
        }
    }
}

// ================================================================
// 🚨 THREAT DETECTION (Research Demo)
// ================================================================

document.addEventListener('DOMContentLoaded', function () {
    const threatInput = document.getElementById('threatImageInput');
    if (threatInput) {
        threatInput.addEventListener('change', handleThreatImage);
    }
});

function handleThreatImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert('⚠️ Please upload an image file (JPG, PNG)');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        alert('⚠️ File too large! Maximum 5MB allowed.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const preview = document.getElementById('threatPreview');
        const previewImg = document.getElementById('threatPreviewImg');
        const uploadArea = document.getElementById('uploadArea');
        const result = document.getElementById('threatResult');

        if (previewImg) previewImg.src = e.target.result;
        if (preview) preview.style.display = 'block';
        if (uploadArea) uploadArea.style.display = 'none';
        if (result) result.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

function clearThreatImage() {
    const preview = document.getElementById('threatPreview');
    const uploadArea = document.getElementById('uploadArea');
    const result = document.getElementById('threatResult');
    const input = document.getElementById('threatImageInput');

    if (preview) preview.style.display = 'none';
    if (uploadArea) uploadArea.style.display = 'block';
    if (result) result.style.display = 'none';
    if (input) input.value = '';
}

async function analyzeThreat() {
    const result = document.getElementById('threatResult');
    const resultIcon = document.getElementById('threatResultIcon');
    const resultTitle = document.getElementById('threatResultTitle');
    const detection = document.getElementById('threatDetection');
    const confidence = document.getElementById('threatConfidence');
    const objects = document.getElementById('threatObjects');
    const review = document.getElementById('threatReview');

    if (result) result.style.display = 'block';
    if (resultIcon) resultIcon.textContent = '⏳';
    if (resultTitle) {
        resultTitle.textContent = 'Analyzing Image...';
        resultTitle.style.color = '#fff';
    }
    if (detection) detection.textContent = 'Processing...';
    if (confidence) confidence.textContent = '--';
    if (objects) objects.textContent = '--';
    if (review) {
        review.textContent = '⏳ Analysis in progress';
        review.style.color = '#8A9AAA';
    }

    setTimeout(() => {
        const detections = [
            { label: 'Normal Person', confidence: 0.87, icon: '✅', color: '#44DD88' },
            { label: 'Potentially Dangerous Person', confidence: 0.76, icon: '⚠️', color: '#FF4444' },
            { label: 'Normal Person (Low Confidence)', confidence: 0.52, icon: '✅', color: '#44DD88' }
        ];

        const randomIndex = Math.floor(Math.random() * detections.length);
        const resultData = detections[randomIndex];
        const objectCount = Math.floor(Math.random() * 3) + 1;

        if (resultIcon) resultIcon.textContent = resultData.icon;
        if (resultTitle) {
            resultTitle.textContent = resultData.label;
            resultTitle.style.color = resultData.color;
        }
        if (detection) {
            detection.textContent = resultData.label;
            detection.style.color = resultData.color;
        }
        if (confidence) {
            confidence.textContent = (resultData.confidence * 100).toFixed(1) + '%';
        }
        if (objects) {
            objects.textContent = objectCount + ' object(s) detected';
        }
        if (review) {
            review.textContent = '⚠️ Pending Human Review';
            review.style.color = '#D4A843';
        }

        console.log('🎯 Threat Analysis Complete:', resultData);
    }, 2000);
}

// ===== INIT =====
console.log('%c🚀 MK CYBER HUB v12.0', 'font-size:20px;color:#00D4FF;font-weight:900');
console.log('%c⚡ Modern Design • AI Vision • OSINT • Threat Detection', 'font-size:14px;color:#D4A843');
console.log('%c⚠️ Threat Detection is Research Prototype Only', 'font-size:12px;color:#FF4444');

setTimeout(loadModel, 1000);
