// ================================================================
// 🐍 MK CYBER HUB - Complete JavaScript v8.2 (FIXED)
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
let visionMode = 'all';
let trackedObjects = {};
let detectionHistory = [];

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
// 📚 OBJECT DATABASE - 80+ Objects
// ================================================================

const OBJECT_DATABASE = {
    'person': { name: 'Person', icon: '👤', category: 'Human', description: 'A human being - most intelligent species on Earth!' },
    'dog': { name: 'Dog', icon: '🐕', category: 'Animal', description: 'Loyal domesticated carnivore - best friend of humans!' },
    'cat': { name: 'Cat', icon: '🐈', category: 'Animal', description: 'Small carnivorous pet - independent and graceful!' },
    'horse': { name: 'Horse', icon: '🐴', category: 'Animal', description: 'Large domesticated mammal - used for riding and work!' },
    'sheep': { name: 'Sheep', icon: '🐑', category: 'Animal', description: 'Domesticated ruminant - raised for wool and meat!' },
    'cow': { name: 'Cow', icon: '🐄', category: 'Animal', description: 'Large domesticated mammal - source of milk and meat!' },
    'elephant': { name: 'Elephant', icon: '🐘', category: 'Animal', description: 'Largest land animal - highly intelligent!' },
    'bear': { name: 'Bear', icon: '🐻', category: 'Animal', description: 'Large omnivorous mammal - powerful and intelligent!' },
    'zebra': { name: 'Zebra', icon: '🦓', category: 'Animal', description: 'African equine - known for distinctive black and white stripes!' },
    'giraffe': { name: 'Giraffe', icon: '🦒', category: 'Animal', description: 'Tallest land animal - known for long neck!' },
    'car': { name: 'Car', icon: '🚗', category: 'Vehicle', description: 'Four-wheeled motor vehicle - invention changed the world!' },
    'motorcycle': { name: 'Motorcycle', icon: '🏍️', category: 'Vehicle', description: 'Two-wheeled motor vehicle - popular for commuting!' },
    'bus': { name: 'Bus', icon: '🚌', category: 'Vehicle', description: 'Large public transport vehicle - carries many passengers!' },
    'truck': { name: 'Truck', icon: '🚚', category: 'Vehicle', description: 'Large commercial vehicle - used for transporting goods!' },
    'train': { name: 'Train', icon: '🚆', category: 'Vehicle', description: 'Railway vehicle - used for long-distance transport!' },
    'bicycle': { name: 'Bicycle', icon: '🚲', category: 'Vehicle', description: 'Two-wheeled human-powered vehicle - eco-friendly!' },
    'airplane': { name: 'Airplane', icon: '✈️', category: 'Vehicle', description: 'Flying vehicle - connects the world!' },
    'boat': { name: 'Boat', icon: '⛵', category: 'Vehicle', description: 'Water vehicle - used for travel and fishing!' },
    'laptop': { name: 'Laptop', icon: '💻', category: 'Electronics', description: 'Portable computer - work from anywhere!' },
    'cell phone': { name: 'Phone', icon: '📱', category: 'Electronics', description: 'Communication device - connected world!' },
    'tv': { name: 'Television', icon: '📺', category: 'Electronics', description: 'Entertainment and information device!' },
    'mouse': { name: 'Mouse', icon: '🖱️', category: 'Electronics', description: 'Computer pointing device - essential accessory!' },
    'keyboard': { name: 'Keyboard', icon: '⌨️', category: 'Electronics', description: 'Input device - typing made easy!' },
    'remote': { name: 'Remote', icon: '🎮', category: 'Electronics', description: 'Control device for electronics!' },
    'microwave': { name: 'Microwave', icon: '📡', category: 'Electronics', description: 'Kitchen appliance - heats food quickly!' },
    'oven': { name: 'Oven', icon: '🔥', category: 'Electronics', description: 'Kitchen appliance - used for baking and roasting!' },
    'toaster': { name: 'Toaster', icon: '🍞', category: 'Electronics', description: 'Kitchen appliance - toasts bread!' },
    'refrigerator': { name: 'Refrigerator', icon: '🧊', category: 'Electronics', description: 'Kitchen appliance - keeps food fresh!' },
    'chair': { name: 'Chair', icon: '🪑', category: 'Furniture', description: 'Seat with backrest - essential furniture!' },
    'table': { name: 'Table', icon: '🪑', category: 'Furniture', description: 'Flat-topped furniture - used for dining and work!' },
    'sofa': { name: 'Sofa', icon: '🛋️', category: 'Furniture', description: 'Comfortable seating - living room essential!' },
    'bed': { name: 'Bed', icon: '🛏️', category: 'Furniture', description: 'Place to sleep - humans spend 1/3 life here!' },
    'dining table': { name: 'Dining Table', icon: '🍽️', category: 'Furniture', description: 'Table for dining - family gathering place!' },
    'toilet': { name: 'Toilet', icon: '🚽', category: 'Furniture', description: 'Sanitary fixture - essential in every home!' },
    'book': { name: 'Book', icon: '📚', category: 'Media', description: 'Collection of written pages - knowledge source!' },
    'clock': { name: 'Clock', icon: '🕐', category: 'Furniture', description: 'Time keeping device - essential for schedule!' },
    'vase': { name: 'Vase', icon: '🏺', category: 'Decor', description: 'Decorative container - used for flowers!' },
    'scissors': { name: 'Scissors', icon: '✂️', category: 'Tool', description: 'Cutting tool - essential in every home!' },
    'teddy bear': { name: 'Teddy Bear', icon: '🧸', category: 'Toy', description: 'Stuffed toy - favorite of children!' },
    'hair drier': { name: 'Hair Dryer', icon: '💨', category: 'Electronics', description: 'Hair drying device - beauty essential!' },
    'toothbrush': { name: 'Toothbrush', icon: '🪥', category: 'Hygiene', description: 'Oral hygiene tool - essential for health!' },
    'bottle': { name: 'Bottle', icon: '🍾', category: 'Container', description: 'Container for liquids - everyday essential!' },
    'wine glass': { name: 'Wine Glass', icon: '🍷', category: 'Kitchen', description: 'Glass for wine - elegant dining!' },
    'cup': { name: 'Cup', icon: '☕', category: 'Kitchen', description: 'Container for drinking - daily essential!' },
    'fork': { name: 'Fork', icon: '🍴', category: 'Kitchen', description: 'Eating utensil - essential for dining!' },
    'knife': { name: 'Knife', icon: '🔪', category: 'Kitchen', description: 'Cutting utensil - essential in kitchen!' },
    'spoon': { name: 'Spoon', icon: '🥄', category: 'Kitchen', description: 'Eating utensil - essential for dining!' },
    'bowl': { name: 'Bowl', icon: '🍜', category: 'Kitchen', description: 'Container for food - essential in kitchen!' },
    'banana': { name: 'Banana', icon: '🍌', category: 'Fruit', description: 'Yellow tropical fruit - rich in potassium!' },
    'apple': { name: 'Apple', icon: '🍎', category: 'Fruit', description: 'Sweet edible fruit - "An apple a day keeps doctor away"!' },
    'orange': { name: 'Orange', icon: '🍊', category: 'Fruit', description: 'Citrus fruit - rich in Vitamin C!' },
    'broccoli': { name: 'Broccoli', icon: '🥦', category: 'Vegetable', description: 'Green vegetable - rich in nutrients!' },
    'carrot': { name: 'Carrot', icon: '🥕', category: 'Vegetable', description: 'Orange root vegetable - good for eyes!' },
    'pizza': { name: 'Pizza', icon: '🍕', category: 'Food', description: 'Flat bread with toppings - world favorite!' },
    'donut': { name: 'Donut', icon: '🍩', category: 'Food', description: 'Sweet fried dough - popular dessert!' },
    'cake': { name: 'Cake', icon: '🎂', category: 'Food', description: 'Sweet baked dessert - celebration essential!' },
    'hot dog': { name: 'Hot Dog', icon: '🌭', category: 'Food', description: 'Grilled sausage in bun - popular fast food!' },
    'sandwich': { name: 'Sandwich', icon: '🥪', category: 'Food', description: 'Bread with filling - quick meal!' },
    'frisbee': { name: 'Frisbee', icon: '🥏', category: 'Sports', description: 'Flying disc - popular for outdoor play!' },
    'skis': { name: 'Skis', icon: '🎿', category: 'Sports', description: 'Equipment for skiing - winter sport!' },
    'snowboard': { name: 'Snowboard', icon: '🏂', category: 'Sports', description: 'Equipment for snowboarding - winter sport!' },
    'sports ball': { name: 'Sports Ball', icon: '⚽', category: 'Sports', description: 'Ball used in various sports!' },
    'kite': { name: 'Kite', icon: '🪁', category: 'Sports', description: 'Flying toy - popular for outdoor fun!' },
    'baseball bat': { name: 'Baseball Bat', icon: '🏏', category: 'Sports', description: 'Equipment for baseball!' },
    'baseball glove': { name: 'Baseball Glove', icon: '🧤', category: 'Sports', description: 'Protective gear for baseball!' },
    'skateboard': { name: 'Skateboard', icon: '🛹', category: 'Sports', description: 'Sporting equipment - popular among youth!' },
    'surfboard': { name: 'Surfboard', icon: '🏄', category: 'Sports', description: 'Equipment for surfing - water sport!' },
    'tennis racket': { name: 'Tennis Racket', icon: '🎾', category: 'Sports', description: 'Equipment for tennis!' },
    'umbrella': { name: 'Umbrella', icon: '☂️', category: 'Accessory', description: 'Protection from rain and sun!' },
    'handbag': { name: 'Handbag', icon: '👜', category: 'Accessory', description: 'Carry bag - fashion essential!' },
    'tie': { name: 'Tie', icon: '👔', category: 'Accessory', description: 'Neckwear - formal attire!' },
    'suitcase': { name: 'Suitcase', icon: '🧳', category: 'Accessory', description: 'Travel bag - essential for trips!' }
};

function getObjectInfo(name) {
    if (!name) return { name: 'Unknown', icon: '❓', category: 'Unknown', description: 'Object detected by AI' };
    const lower = name.toLowerCase();
    
    // Exact match
    if (OBJECT_DATABASE[lower]) return OBJECT_DATABASE[lower];
    
    // Partial match
    for (const [key, val] of Object.entries(OBJECT_DATABASE)) {
        if (lower.includes(key) || key.includes(lower)) return val;
    }
    
    return { name: name.charAt(0).toUpperCase() + name.slice(1), icon: '🔍', category: 'Object', description: 'A ' + name + ' detected by AI Vision' };
}

function getCategory(className) {
    const person = ['person'];
    const devices = ['laptop', 'cell phone', 'tv', 'mouse', 'keyboard', 'remote', 'microwave', 'oven', 'toaster', 'refrigerator', 'hair drier'];
    const vehicles = ['car', 'motorcycle', 'bus', 'truck', 'train', 'bicycle', 'airplane', 'boat'];
    const animals = ['dog', 'cat', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe'];
    const food = ['pizza', 'donut', 'cake', 'hot dog', 'sandwich', 'banana', 'apple', 'orange', 'broccoli', 'carrot'];
    const sports = ['frisbee', 'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket'];
    const furniture = ['chair', 'table', 'sofa', 'bed', 'dining table', 'toilet', 'clock', 'vase'];
    
    if (person.includes(className)) return 'person';
    if (devices.includes(className)) return 'device';
    if (vehicles.includes(className)) return 'vehicle';
    if (animals.includes(className)) return 'animal';
    if (food.includes(className)) return 'food';
    if (sports.includes(className)) return 'sports';
    if (furniture.includes(className)) return 'furniture';
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
    
    // Show/Hide Counter Overlay
    const counterOverlay = document.getElementById('counterOverlay');
    if (mode === 'counter' || mode === 'all') {
        counterOverlay.style.display = 'block';
    } else {
        counterOverlay.style.display = 'none';
    }
    
    const modeNames = { 
        'object': '🎯 Object Detection', 
        'tracking': '🎯 Tracking Mode', 
        'counter': '📊 Counter Mode', 
        'all': '🧠 All Features' 
    };
    document.getElementById('detectedObject').textContent = modeNames[mode] || 'Detecting...';
}

// ================================================================
// 🎯 AI VISION - TENSORFLOW
// ================================================================

async function loadModel() {
    try {
        if (typeof cocoSsd !== 'undefined') {
            model = await cocoSsd.load();
            console.log('✅ COCO-SSD Loaded - 80+ Objects Support');
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
            status.innerHTML = '⏳ LOADING AI...';
            await loadModel();
            if (!model) { status.innerHTML = '❌ FAILED'; return; }
        }
        if (stream) { stream.getTracks().forEach(t => t.stop());
            stream = null; }
        status.innerHTML = '📷 CAMERA...';
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
            audio: false
        });
        video.srcObject = stream;
        await video.play();
        running = true;
        status.innerHTML = '<span class="dot"></span> LIVE';
        document.getElementById('visionStatus').textContent = '🟢 LIVE';
        document.getElementById('statusText').textContent = 'LIVE';
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
        animalCount = 0,
        foodCount = 0,
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
                const filtered = predictions.filter(p => p.score > 0.4);
                
                peopleCount = 0;
                deviceCount = 0;
                vehicleCount = 0;
                animalCount = 0;
                foodCount = 0;
                
                // Colors for different categories
                const colors = {
                    'person': '#00D4FF',
                    'device': '#D4A843',
                    'vehicle': '#FF6B6B',
                    'animal': '#44DD88',
                    'food': '#FF9800',
                    'sports': '#9C27B0',
                    'furniture': '#FF5722',
                    'other': '#8A9AAA'
                };

                // Draw all detected objects
                filtered.forEach((p) => {
                    const category = getCategory(p.class);
                    const color = colors[category] || colors['other'];
                    const info = getObjectInfo(p.class);
                    const confidence = Math.round(p.score * 100);
                    
                    // Count
                    if (category === 'person') peopleCount++;
                    else if (category === 'device') deviceCount++;
                    else if (category === 'vehicle') vehicleCount++;
                    else if (category === 'animal') animalCount++;
                    else if (category === 'food') foodCount++;
                    
                    // ==== Draw Bounding Box ====
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 2.5;
                    ctx.shadowColor = color;
                    ctx.shadowBlur = 10;
                    ctx.strokeRect(p.bbox[0], p.bbox[1], p.bbox[2], p.bbox[3]);
                    ctx.shadowBlur = 0;
                    
                    // ==== Draw Label ====
                    const label = info.icon + ' ' + p.class.toUpperCase() + ' (' + confidence + '%)';
                    ctx.font = 'bold 12px Inter, sans-serif';
                    const metrics = ctx.measureText(label);
                    const textWidth = metrics.width;
                    
                    // Label Background
                    ctx.fillStyle = 'rgba(0,0,0,0.75)';
                    ctx.shadowBlur = 20;
                    ctx.shadowColor = 'rgba(0,0,0,0.5)';
                    ctx.fillRect(p.bbox[0] - 2, p.bbox[1] - 24, textWidth + 16, 24);
                    ctx.shadowBlur = 0;
                    
                    // Label Text
                    ctx.fillStyle = color;
                    ctx.fillText(label, p.bbox[0] + 4, p.bbox[1] - 5);
                    
                    // ==== Category Badge ====
                    const badgeColors = {
                        'person': '#00D4FF',
                        'device': '#D4A843',
                        'vehicle': '#FF6B6B',
                        'animal': '#44DD88',
                        'food': '#FF9800',
                        'sports': '#9C27B0',
                        'furniture': '#FF5722',
                        'other': '#8A9AAA'
                    };
                    ctx.fillStyle = 'rgba(0,0,0,0.6)';
                    ctx.fillRect(p.bbox[0] + p.bbox[2] - 65, p.bbox[1] + p.bbox[3] + 2, 60, 18);
                    ctx.fillStyle = badgeColors[category] || '#8A9AAA';
                    ctx.font = '8px Inter, sans-serif';
                    ctx.fillText(category.toUpperCase(), p.bbox[0] + p.bbox[2] - 60, p.bbox[1] + p.bbox[3] + 15);
                    
                    // ==== Tracking ID ====
                    if (visionMode === 'tracking' || visionMode === 'all') {
                        const id = p.class + '_' + Math.round(p.bbox[0]) + '_' + Math.round(p.bbox[1]);
                        if (!trackedObjects[id]) {
                            trackedObjects[id] = { 
                                id: Object.keys(trackedObjects).length + 1, 
                                class: p.class, 
                                firstSeen: Date.now() 
                            };
                        }
                        ctx.fillStyle = 'rgba(255,255,255,0.4)';
                        ctx.font = '8px Inter';
                        ctx.fillText('#' + trackedObjects[id].id, p.bbox[0] + 4, p.bbox[1] + p.bbox[3] + 14);
                    }
                });

                totalCount = filtered.length;
                
                // ==== Update UI ====
                document.getElementById('objCount').textContent = totalCount;
                document.getElementById('dashTotal').textContent = totalCount;
                document.getElementById('dashPeople').textContent = peopleCount;
                
                document.getElementById('peopleCount').textContent = peopleCount;
                document.getElementById('deviceCount').textContent = deviceCount;
                document.getElementById('vehicleCount').textContent = vehicleCount;
                
                // Update detection info
                if (filtered.length > 0) {
                    const top = filtered[0];
                    const info = getObjectInfo(top.class);
                    const confidence = Math.round(top.score * 100);
                    
                    document.getElementById('detectedObject').textContent = info.icon + ' ' + info.name + ' (' + confidence + '%)';
                    document.getElementById('detectedConfidence').textContent = 'Conf: ' + confidence + '%';
                    document.getElementById('confidence').textContent = confidence + '%';
                    
                    // Auto-update scan details
                    document.getElementById('scanObjectName').textContent = info.name;
                    document.getElementById('scanCategory').textContent = info.category;
                    document.getElementById('scanDescription').textContent = info.description;
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

            } catch (e) { console.log('Detection error:', e); }
        }
    }, 150);
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
    document.getElementById('statusText').textContent = 'STOPPED';
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

console.log('%c⚡ MK CYBER HUB v8.2 - ALL OBJECTS DETECTION', 'font-size:20px;color:#00D4FF;font-weight:900');
console.log('🎯 80+ Objects Support - COCO-SSD Model');
console.log('📸 Categories: Person, Vehicle, Animal, Food, Electronics, Furniture, Sports, etc.');
console.log('✅ All Systems Active');

setTimeout(loadModel, 1500);
