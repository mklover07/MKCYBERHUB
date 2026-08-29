// ================================================================
// 🐍 MK CYBER HUB - ADVANCED AI SCANNER v8.3
// ================================================================

// ===== GLOBALS =====
let model = null;
let stream = null;
let running = false;
let interval = null;
let captureCount = 0;
let galleryImages = [];
let detectionHistory = [];
let frames = 0;
let lastFps = Date.now();

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
// 📚 OBJECT DATABASE - 80+ Objects
// ================================================================

const OBJECT_DB = {
    'person': { name: 'Person', icon: '👤', category: 'Human', desc: 'A human being - most intelligent species!' },
    'dog': { name: 'Dog', icon: '🐕', category: 'Animal', desc: 'Loyal domesticated carnivore - best friend!' },
    'cat': { name: 'Cat', icon: '🐈', category: 'Animal', desc: 'Small carnivorous pet - independent!' },
    'horse': { name: 'Horse', icon: '🐴', category: 'Animal', desc: 'Large domesticated mammal - used for riding!' },
    'sheep': { name: 'Sheep', icon: '🐑', category: 'Animal', desc: 'Domesticated ruminant - raised for wool!' },
    'cow': { name: 'Cow', icon: '🐄', category: 'Animal', desc: 'Large domesticated mammal - source of milk!' },
    'elephant': { name: 'Elephant', icon: '🐘', category: 'Animal', desc: 'Largest land animal - highly intelligent!' },
    'bear': { name: 'Bear', icon: '🐻', category: 'Animal', desc: 'Large omnivorous mammal - powerful!' },
    'zebra': { name: 'Zebra', icon: '🦓', category: 'Animal', desc: 'African equine - distinctive black and white stripes!' },
    'giraffe': { name: 'Giraffe', icon: '🦒', category: 'Animal', desc: 'Tallest land animal - long neck!' },
    'car': { name: 'Car', icon: '🚗', category: 'Vehicle', desc: 'Four-wheeled motor vehicle - changed the world!' },
    'motorcycle': { name: 'Motorcycle', icon: '🏍️', category: 'Vehicle', desc: 'Two-wheeled motor vehicle - popular!' },
    'bus': { name: 'Bus', icon: '🚌', category: 'Vehicle', desc: 'Large public transport vehicle!' },
    'truck': { name: 'Truck', icon: '🚚', category: 'Vehicle', desc: 'Large commercial vehicle - transports goods!' },
    'train': { name: 'Train', icon: '🚆', category: 'Vehicle', desc: 'Railway vehicle - long-distance transport!' },
    'bicycle': { name: 'Bicycle', icon: '🚲', category: 'Vehicle', desc: 'Two-wheeled human-powered vehicle - eco-friendly!' },
    'airplane': { name: 'Airplane', icon: '✈️', category: 'Vehicle', desc: 'Flying vehicle - connects the world!' },
    'boat': { name: 'Boat', icon: '⛵', category: 'Vehicle', desc: 'Water vehicle - travel and fishing!' },
    'laptop': { name: 'Laptop', icon: '💻', category: 'Electronics', desc: 'Portable computer - work from anywhere!' },
    'cell phone': { name: 'Phone', icon: '📱', category: 'Electronics', desc: 'Communication device - connected world!' },
    'tv': { name: 'TV', icon: '📺', category: 'Electronics', desc: 'Entertainment and information device!' },
    'mouse': { name: 'Mouse', icon: '🖱️', category: 'Electronics', desc: 'Computer pointing device - essential!' },
    'keyboard': { name: 'Keyboard', icon: '⌨️', category: 'Electronics', desc: 'Input device - typing made easy!' },
    'remote': { name: 'Remote', icon: '🎮', category: 'Electronics', desc: 'Control device for electronics!' },
    'microwave': { name: 'Microwave', icon: '📡', category: 'Electronics', desc: 'Kitchen appliance - heats food quickly!' },
    'oven': { name: 'Oven', icon: '🔥', category: 'Electronics', desc: 'Kitchen appliance - baking and roasting!' },
    'toaster': { name: 'Toaster', icon: '🍞', category: 'Electronics', desc: 'Kitchen appliance - toasts bread!' },
    'refrigerator': { name: 'Refrigerator', icon: '🧊', category: 'Electronics', desc: 'Kitchen appliance - keeps food fresh!' },
    'chair': { name: 'Chair', icon: '🪑', category: 'Furniture', desc: 'Seat with backrest - essential furniture!' },
    'table': { name: 'Table', icon: '🪑', category: 'Furniture', desc: 'Flat-topped furniture - dining and work!' },
    'sofa': { name: 'Sofa', icon: '🛋️', category: 'Furniture', desc: 'Comfortable seating - living room essential!' },
    'bed': { name: 'Bed', icon: '🛏️', category: 'Furniture', desc: 'Place to sleep - 1/3 life here!' },
    'dining table': { name: 'Dining Table', icon: '🍽️', category: 'Furniture', desc: 'Table for dining - family gathering!' },
    'toilet': { name: 'Toilet', icon: '🚽', category: 'Furniture', desc: 'Sanitary fixture - essential in every home!' },
    'book': { name: 'Book', icon: '📚', category: 'Media', desc: 'Collection of written pages - knowledge source!' },
    'clock': { name: 'Clock', icon: '🕐', category: 'Furniture', desc: 'Time keeping device - essential!' },
    'vase': { name: 'Vase', icon: '🏺', category: 'Decor', desc: 'Decorative container - flowers!' },
    'scissors': { name: 'Scissors', icon: '✂️', category: 'Tool', desc: 'Cutting tool - essential in every home!' },
    'teddy bear': { name: 'Teddy Bear', icon: '🧸', category: 'Toy', desc: 'Stuffed toy - favorite of children!' },
    'hair drier': { name: 'Hair Dryer', icon: '💨', category: 'Electronics', desc: 'Hair drying device - beauty essential!' },
    'toothbrush': { name: 'Toothbrush', icon: '🪥', category: 'Hygiene', desc: 'Oral hygiene tool - essential!' },
    'bottle': { name: 'Bottle', icon: '🍾', category: 'Container', desc: 'Container for liquids - everyday essential!' },
    'wine glass': { name: 'Wine Glass', icon: '🍷', category: 'Kitchen', desc: 'Glass for wine - elegant dining!' },
    'cup': { name: 'Cup', icon: '☕', category: 'Kitchen', desc: 'Container for drinking - daily essential!' },
    'fork': { name: 'Fork', icon: '🍴', category: 'Kitchen', desc: 'Eating utensil - essential for dining!' },
    'knife': { name: 'Knife', icon: '🔪', category: 'Kitchen', desc: 'Cutting utensil - essential in kitchen!' },
    'spoon': { name: 'Spoon', icon: '🥄', category: 'Kitchen', desc: 'Eating utensil - essential for dining!' },
    'bowl': { name: 'Bowl', icon: '🍜', category: 'Kitchen', desc: 'Container for food - essential in kitchen!' },
    'banana': { name: 'Banana', icon: '🍌', category: 'Fruit', desc: 'Yellow tropical fruit - rich in potassium!' },
    'apple': { name: 'Apple', icon: '🍎', category: 'Fruit', desc: 'Sweet edible fruit - "An apple a day keeps doctor away"!' },
    'orange': { name: 'Orange', icon: '🍊', category: 'Fruit', desc: 'Citrus fruit - rich in Vitamin C!' },
    'broccoli': { name: 'Broccoli', icon: '🥦', category: 'Vegetable', desc: 'Green vegetable - rich in nutrients!' },
    'carrot': { name: 'Carrot', icon: '🥕', category: 'Vegetable', desc: 'Orange root vegetable - good for eyes!' },
    'pizza': { name: 'Pizza', icon: '🍕', category: 'Food', desc: 'Flat bread with toppings - world favorite!' },
    'donut': { name: 'Donut', icon: '🍩', category: 'Food', desc: 'Sweet fried dough - popular dessert!' },
    'cake': { name: 'Cake', icon: '🎂', category: 'Food', desc: 'Sweet baked dessert - celebration essential!' },
    'hot dog': { name: 'Hot Dog', icon: '🌭', category: 'Food', desc: 'Grilled sausage in bun - popular fast food!' },
    'sandwich': { name: 'Sandwich', icon: '🥪', category: 'Food', desc: 'Bread with filling - quick meal!' },
    'frisbee': { name: 'Frisbee', icon: '🥏', category: 'Sports', desc: 'Flying disc - popular for outdoor play!' },
    'skis': { name: 'Skis', icon: '🎿', category: 'Sports', desc: 'Equipment for skiing - winter sport!' },
    'snowboard': { name: 'Snowboard', icon: '🏂', category: 'Sports', desc: 'Equipment for snowboarding - winter sport!' },
    'sports ball': { name: 'Sports Ball', icon: '⚽', category: 'Sports', desc: 'Ball used in various sports!' },
    'kite': { name: 'Kite', icon: '🪁', category: 'Sports', desc: 'Flying toy - popular for outdoor fun!' },
    'baseball bat': { name: 'Baseball Bat', icon: '🏏', category: 'Sports', desc: 'Equipment for baseball!' },
    'baseball glove': { name: 'Baseball Glove', icon: '🧤', category: 'Sports', desc: 'Protective gear for baseball!' },
    'skateboard': { name: 'Skateboard', icon: '🛹', category: 'Sports', desc: 'Sporting equipment - popular among youth!' },
    'surfboard': { name: 'Surfboard', icon: '🏄', category: 'Sports', desc: 'Equipment for surfing - water sport!' },
    'tennis racket': { name: 'Tennis Racket', icon: '🎾', category: 'Sports', desc: 'Equipment for tennis!' },
    'umbrella': { name: 'Umbrella', icon: '☂️', category: 'Accessory', desc: 'Protection from rain and sun!' },
    'handbag': { name: 'Handbag', icon: '👜', category: 'Accessory', desc: 'Carry bag - fashion essential!' },
    'tie': { name: 'Tie', icon: '👔', category: 'Accessory', desc: 'Neckwear - formal attire!' },
    'suitcase': { name: 'Suitcase', icon: '🧳', category: 'Accessory', desc: 'Travel bag - essential for trips!' }
};

function getObjectInfo(name) {
    if (!name) return { name: 'Unknown', icon: '❓', category: 'Object', desc: 'Detected by AI' };
    const lower = name.toLowerCase();
    if (OBJECT_DB[lower]) return OBJECT_DB[lower];
    for (const [key, val] of Object.entries(OBJECT_DB)) {
        if (lower.includes(key) || key.includes(lower)) return val;
    }
    return { name: name, icon: '🔍', category: 'Object', desc: 'A ' + name + ' detected by AI' };
}

function getCategory(className) {
    const categories = {
        'person': 'person',
        'device': ['laptop','cell phone','tv','mouse','keyboard','remote','microwave','oven','toaster','refrigerator','hair drier'],
        'vehicle': ['car','motorcycle','bus','truck','train','bicycle','airplane','boat'],
        'animal': ['dog','cat','horse','sheep','cow','elephant','bear','zebra','giraffe'],
        'food': ['pizza','donut','cake','hot dog','sandwich','banana','apple','orange','broccoli','carrot'],
        'sports': ['frisbee','skis','snowboard','sports ball','kite','baseball bat','baseball glove','skateboard','surfboard','tennis racket'],
        'furniture': ['chair','table','sofa','bed','dining table','toilet','clock','vase']
    };
    for (const [cat, items] of Object.entries(categories)) {
        if (items.includes(className)) return cat;
    }
    return 'other';
}

// ================================================================
// 🎯 AI VISION - ADVANCED SCANNER
// ================================================================

async function loadModel() {
    try {
        document.getElementById('aiStatus').textContent = 'Loading...';
        if (typeof cocoSsd !== 'undefined') {
            model = await cocoSsd.load();
            document.getElementById('aiStatus').textContent = '✅ Ready (80+ Objects)';
            console.log('✅ COCO-SSD Loaded - 80+ Objects');
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
        status.innerHTML = '<span class="dot"></span> LIVE SCANNING';
        document.getElementById('visionStatus').textContent = '🟢 LIVE';
        startAdvancedDetection();

    } catch (e) {
        status.innerHTML = '❌ ' + e.message;
        console.error('Camera error:', e);
    }
}

function startAdvancedDetection() {
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
            document.getElementById('fps').textContent = frameCount;
            document.getElementById('fpsDisplay').textContent = 'FPS: ' + frameCount;
            frameCount = 0;
            lastFpsTime = Date.now();
        }

        if (model) {
            try {
                const predictions = await model.detect(video);
                const filtered = predictions.filter(p => p.score > 0.35);

                document.getElementById('objCount').textContent = filtered.length;

                // Color palette for categories
                const colors = {
                    'person': '#00D4FF',
                    'vehicle': '#FF6B6B',
                    'animal': '#44DD88',
                    'food': '#FF9800',
                    'electronics': '#D4A843',
                    'furniture': '#FF5722',
                    'sports': '#9C27B0',
                    'other': '#8A9AAA'
                };

                if (filtered.length > 0) {
                    filtered.forEach(p => {
                        const category = getCategory(p.class);
                        const color = colors[category] || colors['other'];
                        const info = getObjectInfo(p.class);
                        const confidence = Math.round(p.score * 100);

                        // ==== Bounding Box ====
                        ctx.strokeStyle = color;
                        ctx.lineWidth = 2.5;
                        ctx.shadowColor = color;
                        ctx.shadowBlur = 8;
                        ctx.strokeRect(p.bbox[0], p.bbox[1], p.bbox[2], p.bbox[3]);
                        ctx.shadowBlur = 0;

                        // ==== Label ====
                        const label = info.icon + ' ' + p.class.toUpperCase() + ' (' + confidence + '%)';
                        ctx.font = 'bold 13px Inter, sans-serif';
                        const metrics = ctx.measureText(label);
                        
                        ctx.fillStyle = 'rgba(0,0,0,0.75)';
                        ctx.fillRect(p.bbox[0] - 2, p.bbox[1] - 26, metrics.width + 18, 26);
                        ctx.fillStyle = color;
                        ctx.fillText(label, p.bbox[0] + 4, p.bbox[1] - 6);

                        // ==== Category Badge ====
                        ctx.fillStyle = 'rgba(0,0,0,0.5)';
                        ctx.fillRect(p.bbox[0] + p.bbox[2] - 70, p.bbox[1] + p.bbox[3] + 2, 65, 18);
                        ctx.fillStyle = color;
                        ctx.font = '8px Inter, sans-serif';
                        ctx.fillText(category.toUpperCase(), p.bbox[0] + p.bbox[2] - 65, p.bbox[1] + p.bbox[3] + 14);
                    });

                    // ==== Update UI ====
                    const top = filtered[0];
                    const info = getObjectInfo(top.class);
                    const confidence = Math.round(top.score * 100);
                    
                    document.getElementById('detectedObject').textContent = info.icon + ' ' + info.name + ' (' + confidence + '%)';
                    document.getElementById('detectedConfidence').textContent = 'Conf: ' + confidence + '%';
                    document.getElementById('confidence').textContent = confidence + '%';
                    
                    // Update scan details
                    document.getElementById('scanObjectName').textContent = info.name;
                    document.getElementById('scanCategory').textContent = info.category;
                    document.getElementById('scanDescription').textContent = info.desc;
                    document.getElementById('scanConfidence').textContent = confidence + '%';

                    // Detection History
                    if (detectionHistory.length === 0 || detectionHistory[detectionHistory.length-1].name !== info.name) {
                        detectionHistory.push({
                            name: info.name,
                            icon: info.icon,
                            category: info.category,
                            confidence: confidence,
                            time: new Date().toLocaleTimeString()
                        });
                        if (detectionHistory.length > 20) detectionHistory.shift();
                    }

                } else {
                    document.getElementById('detectedObject').textContent = '🔍 No Object';
                    document.getElementById('detectedConfidence').textContent = 'Conf: --%';
                    document.getElementById('confidence').textContent = '--%';
                }

            } catch (e) {
                console.error('Detection error:', e);
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

// ================================================================
// 📸 CAPTURE FUNCTIONS
// ================================================================

function captureFrame() {
    if (!running) {
        alert('START CAMERA FIRST!');
        return;
    }
    
    const canvas = document.getElementById('canvas');
    const imgData = canvas.toDataURL('image/jpeg');
    
    // Gallery
    const grid = document.getElementById('galleryGrid');
    const img = document.createElement('img');
    img.src = imgData;
    img.onclick = function() { viewCapture(this.src); };
    grid.appendChild(img);
    galleryImages.push(imgData);
    
    // Show result
    document.getElementById('scanResultImage').src = imgData;
    document.getElementById('scanResults').style.display = 'block';
    document.getElementById('scanStatus').textContent = '✅ Complete';
    document.getElementById('scanTime').textContent = new Date().toLocaleTimeString();
    
    captureCount++;
    document.getElementById('captureCount').textContent = 'Captures: ' + captureCount;
    document.getElementById('dashScans').textContent = captureCount;
}

function viewCapture(src) {
    document.getElementById('scanResultImage').src = src;
    document.getElementById('scanResults').style.display = 'block';
    document.getElementById('scanStatus').textContent = '📷 Gallery View';
}

function clearGallery() {
    if (confirm('Clear all gallery images?')) {
        document.getElementById('galleryGrid').innerHTML = '';
        galleryImages = [];
    }
}

function downloadImage() {
    const img = document.getElementById('scanResultImage');
    if (!img.src || img.src === '') {
        alert('No image to download!');
        return;
    }
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
    } else {
        alert('SCAN AN OBJECT FIRST!');
    }
}

function liveYouTubeSearch() {
    const obj = document.getElementById('scanObjectName').textContent;
    if (obj && obj !== '-' && obj !== 'Unknown') {
        window.open('https://www.youtube.com/results?search_query=' + encodeURIComponent(obj), '_blank');
    } else {
        alert('SCAN AN OBJECT FIRST!');
    }
}

function liveWikipediaPage() {
    const obj = document.getElementById('scanObjectName').textContent;
    if (obj && obj !== '-' && obj !== 'Unknown') {
        window.open('https://en.wikipedia.org/wiki/' + encodeURIComponent(obj), '_blank');
    } else {
        alert('SCAN AN OBJECT FIRST!');
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

console.log('%c⚡ MK CYBER HUB v8.3 - ADVANCED SCANNER', 'font-size:20px;color:#00D4FF;font-weight:900');
console.log('🎯 80+ Objects Detection | Real-time | Live');
console.log('📸 Click START AI to begin scanning');

setTimeout(loadModel, 1000);
