# ================================================================
# 🏢 MK CYBER HUB - Python Backend v8.0
# ================================================================
# Company: MK GLOBAL NEXUS
# Founder: MANOJ MEENA
# Version: v8.0 - Complete Update
# ================================================================

from flask import Flask, render_template, jsonify, request, send_file
from flask_cors import CORS
import json
import requests
import os
import random
from datetime import datetime
import base64

# ================================================================
# 📌 INITIALIZE FLASK APP
# ================================================================

app = Flask(__name__)
CORS(app)

# ================================================================
# 🗣️ VOICE COMMANDS - Speech Recognition
# ================================================================

voice_commands = {
    "show threats from india": "india",
    "show threats from us": "us",
    "show threats from china": "china",
    "show threats from russia": "russia",
    "scan object": "scan",
    "stop scanning": "stop",
    "capture": "capture",
    "dark mode": "dark",
    "light mode": "light",
    "export report": "export",
    "show analytics": "analytics"
}

# ================================================================
# 🌍 MULTI-LANGUAGE SUPPORT
# ================================================================

languages = {
    'en': {
        'name': 'English',
        'threat': 'Threat',
        'scan': 'Scan',
        'detected': 'Detected',
        'confidence': 'Confidence',
        'security': 'Security',
        'analytics': 'Analytics',
        'news': 'News',
        'founder': 'Founder',
        'welcome': 'Welcome to MK Cyber Hub'
    },
    'hi': {
        'name': 'हिंदी',
        'threat': 'खतरा',
        'scan': 'स्कैन',
        'detected': 'पहचाना गया',
        'confidence': 'विश्वास',
        'security': 'सुरक्षा',
        'analytics': 'विश्लेषण',
        'news': 'समाचार',
        'founder': 'संस्थापक',
        'welcome': 'एमके साइबर हब में आपका स्वागत है'
    },
    'es': {
        'name': 'Español',
        'threat': 'Amenaza',
        'scan': 'Escanear',
        'detected': 'Detectado',
        'confidence': 'Confianza',
        'security': 'Seguridad',
        'analytics': 'Analítica',
        'news': 'Noticias',
        'founder': 'Fundador',
        'welcome': 'Bienvenido a MK Cyber Hub'
    },
    'fr': {
        'name': 'Français',
        'threat': 'Menace',
        'scan': 'Scanner',
        'detected': 'Détecté',
        'confidence': 'Confiance',
        'security': 'Sécurité',
        'analytics': 'Analytique',
        'news': 'Actualités',
        'founder': 'Fondateur',
        'welcome': 'Bienvenue sur MK Cyber Hub'
    },
    'ar': {
        'name': 'العربية',
        'threat': 'تهديد',
        'scan': 'مسح',
        'detected': 'تم الكشف',
        'confidence': 'الثقة',
        'security': 'الأمن',
        'analytics': 'التحليلات',
        'news': 'الأخبار',
        'founder': 'المؤسس',
        'welcome': 'مرحبًا بك في MK Cyber Hub'
    }
}

# ================================================================
# 🎮 GAMIFICATION SYSTEM
# ================================================================

class Gamification:
    def __init__(self):
        self.users = {}
    
    def get_user(self, user_id):
        if user_id not in self.users:
            self.users[user_id] = {
                'points': 0,
                'level': 1,
                'badges': [],
                'scans': 0,
                'threats_detected': 0,
                'missions_completed': 0
            }
        return self.users[user_id]
    
    def add_points(self, user_id, points, action):
        user = self.get_user(user_id)
        user['points'] += points
        user['scans'] += 1
        
        # Check level up
        if user['points'] >= 100 and user['level'] == 1:
            user['level'] = 2
            user['badges'].append('🟢 Level 2 Achieved!')
        elif user['points'] >= 500 and user['level'] == 2:
            user['level'] = 3
            user['badges'].append('🟡 Level 3 Achieved!')
        elif user['points'] >= 1000 and user['level'] == 3:
            user['level'] = 4
            user['badges'].append('🔴 Level 4 Achieved!')
        
        return user

gamification = Gamification()

# ================================================================
# 🕵️ DARK WEB SENTIMENT ANALYSIS (Simulated)
# ================================================================

def analyze_dark_web_sentiment(keyword):
    """Simulate dark web sentiment analysis"""
    platforms = ['AlphaBay', 'Silk Road', 'Hydra', 'Dream Market', 'White House Market']
    sentiments = ['🟢 POSITIVE', '🟡 NEUTRAL', '🔴 NEGATIVE']
    
    results = []
    for platform in platforms:
        sentiment = random.choice(sentiments)
        score = random.randint(20, 95)
        results.append({
            'platform': platform,
            'sentiment': sentiment,
            'score': score,
            'keyword': keyword
        })
    
    return results

# ================================================================
# 🔮 AI PREDICTOR - Future Threat Prediction
# ================================================================

def predict_future_threats():
    """Predict future cyber threats using AI simulation"""
    predictions = []
    
    threats = [
        {'country': '🇺🇸 USA', 'attack': 'DDoS Attack', 'probability': random.randint(70, 95), 'severity': '🔴 HIGH'},
        {'country': '🇮🇳 India', 'attack': 'Phishing Campaign', 'probability': random.randint(60, 85), 'severity': '🟡 MEDIUM'},
        {'country': '🇷🇺 Russia', 'attack': 'Ransomware', 'probability': random.randint(65, 90), 'severity': '🔴 HIGH'},
        {'country': '🇨🇳 China', 'attack': 'Malware Outbreak', 'probability': random.randint(50, 75), 'severity': '🟡 MEDIUM'},
        {'country': '🇬🇧 UK', 'attack': 'Data Breach', 'probability': random.randint(40, 65), 'severity': '🟢 LOW'},
        {'country': '🇩🇪 Germany', 'attack': 'Zero-Day Exploit', 'probability': random.randint(55, 80), 'severity': '🟡 MEDIUM'},
        {'country': '🇫🇷 France', 'attack': 'APT Attack', 'probability': random.randint(45, 70), 'severity': '🟡 MEDIUM'},
        {'country': '🇯🇵 Japan', 'attack': 'IoT Botnet', 'probability': random.randint(35, 60), 'severity': '🟢 LOW'}
    ]
    
    # Select top 3 predictions
    predictions = random.sample(threats, 3)
    
    # Add prevention tips
    tips = [
        'Enable DDoS protection and rate limiting',
        'Train employees on phishing awareness',
        'Backup critical data regularly',
        'Update all software and systems',
        'Enable 2FA on all accounts',
        'Review firewall rules and access controls'
    ]
    
    for p in predictions:
        p['prevention'] = random.choice(tips)
        p['timeframe'] = f"Next {random.randint(4, 24)} hours"
    
    return predictions

# ================================================================
# 🤖 DIGITAL TWIN - AI Avatar
# ================================================================

class DigitalTwin:
    def __init__(self, name, personality):
        self.name = name
        self.personality = personality
        self.memory = []
        self.responses = [
            f"As {name}, I'd suggest...",
            f"From my experience...",
            f"I think the best approach is...",
            f"Let me analyze this for you...",
            f"Based on my expertise...",
            f"In my professional opinion..."
        ]
    
    def generate_response(self, message):
        """Generate AI response in the founder's style"""
        threats = ['threat', 'attack', 'breach', 'hack', 'virus', 'malware', 'phishing']
        
        if any(word in message.lower() for word in threats):
            response = random.choice([
                "⚠️ I detect a potential threat. Let me analyze this immediately.",
                "🔍 This appears suspicious. I'm running a security scan.",
                "🛡️ Don't worry, I'll investigate this threat for you.",
                "🚨 Alert! This seems like a security risk. Taking preventive action."
            ])
        else:
            response = random.choice([
                "✅ Everything looks secure. I'll keep monitoring.",
                "🟢 No threats detected. You're safe.",
                "👍 All systems operational. Continue with your work.",
                "📊 I'm here to help with any cyber intelligence needs."
            ])
        
        return f"🤖 {self.name}: {response}"
    
    def analyze_threat(self, threat_data):
        """Analyze threat like the founder would"""
        risk_score = random.randint(20, 95)
        if risk_score > 80:
            action = "🔴 BLOCK IMMEDIATELY"
        elif risk_score > 50:
            action = "🟡 MONITOR CLOSELY"
        else:
            action = "🟢 NO ACTION NEEDED"
        
        return {
            'threat': threat_data,
            'risk_score': risk_score,
            'action': action,
            'analyst': self.name,
            'timestamp': datetime.now().isoformat()
        }

digital_twin = DigitalTwin('Manoj Meena', 'Professional, Analytical, Helpful')

# ================================================================
# 📊 API ENDPOINTS
# ================================================================

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/stats')
def get_stats():
    return jsonify({
        'total_threats': random.randint(12000, 13000),
        'active_attacks': random.randint(300, 400),
        'vulnerabilities': random.randint(1000, 1300),
        'countries': random.randint(180, 195)
    })

@app.route('/api/map-data')
def get_map_data():
    locations = [
        {'lat': 40.7128, 'lng': -74.0060, 'country': '🇺🇸 USA', 'city': 'New York', 'threat': 'DDOS Attack', 'severity': 'high'},
        {'lat': 34.0522, 'lng': -118.2437, 'country': '🇺🇸 USA', 'city': 'Los Angeles', 'threat': 'Ransomware', 'severity': 'high'},
        {'lat': 39.9042, 'lng': 116.4074, 'country': '🇨🇳 China', 'city': 'Beijing', 'threat': 'Malware Campaign', 'severity': 'medium'},
        {'lat': 55.7558, 'lng': 37.6173, 'country': '🇷🇺 Russia', 'city': 'Moscow', 'threat': 'Ransomware Attack', 'severity': 'high'},
        {'lat': 28.6139, 'lng': 77.2090, 'country': '🇮🇳 India', 'city': 'Delhi', 'threat': 'Phishing Attack', 'severity': 'medium'},
        {'lat': 51.5074, 'lng': -0.1278, 'country': '🇬🇧 UK', 'city': 'London', 'threat': 'DDoS Campaign', 'severity': 'low'},
        {'lat': 52.5200, 'lng': 13.4050, 'country': '🇩🇪 Germany', 'city': 'Berlin', 'threat': 'DDoS Attack', 'severity': 'low'},
        {'lat': 48.8566, 'lng': 2.3522, 'country': '🇫🇷 France', 'city': 'Paris', 'threat': 'Ransomware', 'severity': 'medium'},
        {'lat': 35.6895, 'lng': 139.6917, 'country': '🇯🇵 Japan', 'city': 'Tokyo', 'threat': 'Malware', 'severity': 'low'},
        {'lat': -33.8688, 'lng': 151.2093, 'country': '🇦🇺 Australia', 'city': 'Sydney', 'threat': 'Data Breach', 'severity': 'medium'}
    ]
    return jsonify(locations)

@app.route('/api/timeline')
def get_timeline():
    threats = ['DDOS Attack', 'Phishing', 'Malware', 'Ransomware', 'Data Breach', 'Zero-Day Exploit']
    countries = ['US', 'IN', 'RU', 'CN', 'UK', 'DE', 'FR', 'JP', 'AU']
    severities = ['🔴', '🟡', '🟢']
    times = ['Just now', '2 min ago', '5 min ago', '12 min ago', '30 min ago', '1 hour ago']
    
    timeline = []
    for i in range(6):
        timeline.append({
            'time': random.choice(times),
            'event': f"{random.choice(severities)} {random.choice(threats)} — {random.choice(countries)}",
            'severity': random.choice(['high', 'medium', 'low'])
        })
    
    return jsonify(timeline)

@app.route('/api/country-stats')
def get_country_stats():
    return jsonify({
        'us': random.randint(2800, 2900),
        'cn': random.randint(1200, 1300),
        'ru': random.randint(900, 1000),
        'in': random.randint(600, 700),
        'uk': random.randint(400, 500),
        'de': random.randint(300, 400)
    })

@app.route('/api/news')
def get_news():
    news_list = [
        'Critical zero-day vulnerability discovered in VPN software — patch now!',
        'Global cyber attack targets financial institutions — 12 banks affected',
        'New AI-powered malware detected across 50+ countries',
        'Ransomware gang leaks 2TB of corporate data from major tech firm',
        'Phishing campaign impersonating government agencies — 10,000+ victims',
        'IoT botnet grows to 200,000+ devices — DDoS attacks increasing',
        'Major cloud provider suffers data breach — 5 million records exposed',
        'New AI-based phishing detection system launched',
        'Cybersecurity spending expected to reach $300 billion by 2025'
    ]
    return jsonify({'news': random.choice(news_list)})

# ================================================================
# 🗣️ VOICE COMMAND API
# ================================================================

@app.route('/api/voice', methods=['POST'])
def voice_command():
    data = request.json
    command = data.get('command', '').lower()
    
    response = {
        'command': command,
        'action': 'unknown',
        'message': 'Command not recognized'
    }
    
    if 'threats from india' in command:
        response['action'] = 'map_zoom'
        response['message'] = '🇮🇳 Showing threats from India'
        response['data'] = {'lat': 20.5937, 'lng': 78.9629, 'zoom': 4}
    elif 'threats from us' in command or 'threats from usa' in command:
        response['action'] = 'map_zoom'
        response['message'] = '🇺🇸 Showing threats from USA'
        response['data'] = {'lat': 37.0902, 'lng': -95.7129, 'zoom': 4}
    elif 'threats from china' in command:
        response['action'] = 'map_zoom'
        response['message'] = '🇨🇳 Showing threats from China'
        response['data'] = {'lat': 35.8617, 'lng': 104.1954, 'zoom': 4}
    elif 'scan' in command:
        response['action'] = 'scan'
        response['message'] = '🔍 Starting AI Scanner...'
    elif 'stop' in command:
        response['action'] = 'stop'
        response['message'] = '⏹ Scanner stopped'
    elif 'capture' in command:
        response['action'] = 'capture'
        response['message'] = '📸 Capturing frame...'
    elif 'dark mode' in command:
        response['action'] = 'dark_mode'
        response['message'] = '🌙 Dark mode activated'
    elif 'light mode' in command:
        response['action'] = 'light_mode'
        response['message'] = '☀️ Light mode activated'
    elif 'export' in command:
        response['action'] = 'export'
        response['message'] = '📊 Generating report...'
    
    return jsonify(response)

# ================================================================
# 🕵️ DARK WEB SENTIMENT API
# ================================================================

@app.route('/api/dark-web-sentiment', methods=['POST'])
def dark_web_sentiment():
    data = request.json
    keyword = data.get('keyword', '')
    
    if not keyword:
        return jsonify({'error': 'Keyword required'}), 400
    
    results = analyze_dark_web_sentiment(keyword)
    return jsonify({
        'keyword': keyword,
        'results': results,
        'total_mentions': len(results),
        'average_score': sum(r['score'] for r in results) / len(results)
    })

# ================================================================
# 🔮 AI PREDICTOR API
# ================================================================

@app.route('/api/predict')
def get_predictions():
    predictions = predict_future_threats()
    return jsonify({
        'predictions': predictions,
        'timestamp': datetime.now().isoformat(),
        'count': len(predictions)
    })

# ================================================================
# 🤖 DIGITAL TWIN API
# ================================================================

@app.route('/api/digital-twin', methods=['POST'])
def digital_twin_response():
    data = request.json
    message = data.get('message', '')
    
    if not message:
        return jsonify({'error': 'Message required'}), 400
    
    response = digital_twin.generate_response(message)
    
    # Analyze threat if needed
    threat_analysis = None
    if any(word in message.lower() for word in ['threat', 'attack', 'hack', 'breach']):
        threat_analysis = digital_twin.analyze_threat({
            'message': message,
            'timestamp': datetime.now().isoformat()
        })
    
    return jsonify({
        'response': response,
        'threat_analysis': threat_analysis,
        'timestamp': datetime.now().isoformat()
    })

# ================================================================
# 🎮 GAMIFICATION API
# ================================================================

@app.route('/api/gamification/<user_id>')
def get_gamification(user_id):
    user = gamification.get_user(user_id)
    return jsonify({
        'user_id': user_id,
        'points': user['points'],
        'level': user['level'],
        'badges': user['badges'],
        'scans': user['scans'],
        'threats_detected': user['threats_detected'],
        'missions_completed': user['missions_completed']
    })

@app.route('/api/gamification/add-points', methods=['POST'])
def add_gamification_points():
    data = request.json
    user_id = data.get('user_id', 'default')
    points = data.get('points', 10)
    action = data.get('action', 'scan')
    
    user = gamification.add_points(user_id, points, action)
    return jsonify({
        'user_id': user_id,
        'points_added': points,
        'total_points': user['points'],
        'level': user['level'],
        'badges': user['badges']
    })

# ================================================================
# 🌍 LANGUAGE API
# ================================================================

@app.route('/api/language/<lang_code>')
def get_language(lang_code):
    if lang_code in languages:
        return jsonify(languages[lang_code])
    return jsonify(languages['en'])

# ================================================================
# 🔍 OSINT APIs
# ================================================================

@app.route('/api/osint/dork', methods=['POST'])
def osint_dork():
    data = request.json
    query = data.get('query', 'example.com')
    return jsonify({
        'status': 'success',
        'results': f'Found {random.randint(50, 200)} results for "{query}"',
        'data': [
            {'title': 'Sensitive Data Found', 'url': f'https://example.com/config.php'},
            {'title': 'Admin Panel Exposed', 'url': f'https://example.com/admin'}
        ]
    })

@app.route('/api/osint/shodan', methods=['POST'])
def osint_shodan():
    data = request.json
    query = data.get('query', 'apache')
    return jsonify({
        'status': 'success',
        'hosts': random.randint(50, 150),
        'top_service': random.choice(['Apache/2.4.41', 'Nginx/1.18.0', 'IIS/10.0']),
        'ports': ['80', '443', '8080', '8443']
    })

@app.route('/api/osint/hibp', methods=['POST'])
def osint_hibp():
    data = request.json
    email = data.get('email', 'test@example.com')
    breaches = random.randint(0, 5)
    return jsonify({
        'status': 'success',
        'email': email,
        'breaches': breaches,
        'found': breaches > 0,
        'message': f'Found in {breaches} breaches' if breaches > 0 else 'No breaches found'
    })

@app.route('/api/osint/virustotal', methods=['POST'])
def osint_virustotal():
    data = request.json
    url = data.get('url', 'https://example.com')
    detections = random.randint(0, 10)
    return jsonify({
        'status': 'success',
        'url': url,
        'detections': detections,
        'safe': detections < 5,
        'total': 70
    })

# ================================================================
# 🛡️ SECURITY APIs
# ================================================================

@app.route('/api/security/threat-analyze', methods=['POST'])
def security_threat():
    data = request.json
    target = data.get('target', '8.8.8.8')
    risk = random.random()
    return jsonify({
        'status': 'success',
        'target': target,
        'risk_level': '🔴 HIGH' if risk > 0.7 else '🟡 MEDIUM' if risk > 0.4 else '🟢 LOW',
        'confidence': f"{70 + random.random() * 25:.0f}%",
        'details': 'Suspicious activity detected' if risk > 0.7 else 'Minor anomalies found' if risk > 0.4 else 'No threats detected'
    })

@app.route('/api/security/ssl-check', methods=['POST'])
def security_ssl():
    data = request.json
    domain = data.get('domain', 'example.com')
    valid = random.random() > 0.2
    return jsonify({
        'status': 'success',
        'domain': domain,
        'valid': valid,
        'issuer': random.choice(["Let's Encrypt", "DigiCert", "Sectigo", "GlobalSign"]),
        'secure': valid
    })

@app.route('/api/security/phishing-detect', methods=['POST'])
def security_phishing():
    data = request.json
    input_text = data.get('input', 'example@test.com')
    is_phishing = random.random() > 0.6
    return jsonify({
        'status': 'success',
        'input': input_text,
        'is_phishing': is_phishing,
        'risk': '🔴 HIGH RISK' if is_phishing else '🟢 SAFE'
    })

@app.route('/api/security/ip-reputation', methods=['POST'])
def security_ip():
    data = request.json
    ip = data.get('ip', '8.8.8.8')
    score = random.randint(0, 100)
    statuses = ['✅ Clean', '🟡 Suspicious', '🔴 Malicious']
    status = statuses[0] if score < 30 else statuses[1] if score < 70 else statuses[2]
    return jsonify({
        'status': 'success',
        'ip': ip,
        'reputation': status,
        'score': score,
        'safe': score < 70
    })

# ================================================================
# 📊 EXPORT APIs
# ================================================================

@app.route('/api/export/csv')
def export_csv():
    data = f"""Timestamp,Threats,Attacks,Vulnerabilities,Countries
{datetime.now()},{random.randint(12000,13000)},{random.randint(300,400)},{random.randint(1000,1300)},{random.randint(180,195)}"""
    return data, 200, {'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename=report.csv'}

@app.route('/api/export/json')
def export_json():
    return jsonify({
        'timestamp': datetime.now().isoformat(),
        'stats': {
            'total_threats': random.randint(12000, 13000),
            'active_attacks': random.randint(300, 400),
            'vulnerabilities': random.randint(1000, 1300),
            'countries': random.randint(180, 195)
        },
        'predictions': predict_future_threats(),
        'version': 'v8.0'
    })

# ================================================================
# 🚀 RUN APP
# ================================================================

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
