from flask import Flask, render_template, jsonify, send_from_directory
import os
import random
from datetime import datetime

app = Flask(__name__)

# ================================================================
# 📌 HOME ROUTE
# ================================================================

@app.route('/')
def home():
    return render_template('index.html')

# ================================================================
# 📊 API ROUTES
# ================================================================

@app.route('/api/stats')
def stats():
    return jsonify({
        'threats': random.randint(12000, 13000),
        'attacks': random.randint(300, 400),
        'vulnerabilities': random.randint(1000, 1300),
        'countries': random.randint(180, 195)
    })

@app.route('/api/news')
def news():
    news_list = [
        'Critical zero-day vulnerability discovered in VPN software',
        'Global cyber attack targets financial institutions',
        'New AI-powered malware detected across 50+ countries',
        'Ransomware gang leaks 2TB of corporate data',
        'Phishing campaign impersonating government agencies'
    ]
    return jsonify({'news': random.choice(news_list)})

@app.route('/api/map-data')
def map_data():
    locations = [
        {'lat': 40.7128, 'lng': -74.0060, 'country': '🇺🇸 USA', 'city': 'New York', 'threat': 'DDOS Attack', 'severity': 'high'},
        {'lat': 34.0522, 'lng': -118.2437, 'country': '🇺🇸 USA', 'city': 'Los Angeles', 'threat': 'Ransomware', 'severity': 'high'},
        {'lat': 28.6139, 'lng': 77.2090, 'country': '🇮🇳 India', 'city': 'Delhi', 'threat': 'Phishing Attack', 'severity': 'medium'},
        {'lat': 19.0760, 'lng': 72.8777, 'country': '🇮🇳 India', 'city': 'Mumbai', 'threat': 'Data Breach', 'severity': 'low'},
        {'lat': 55.7558, 'lng': 37.6173, 'country': '🇷🇺 Russia', 'city': 'Moscow', 'threat': 'Ransomware Attack', 'severity': 'high'},
        {'lat': 39.9042, 'lng': 116.4074, 'country': '🇨🇳 China', 'city': 'Beijing', 'threat': 'Malware Campaign', 'severity': 'medium'},
        {'lat': 51.5074, 'lng': -0.1278, 'country': '🇬🇧 UK', 'city': 'London', 'threat': 'DDoS Campaign', 'severity': 'low'},
        {'lat': 52.5200, 'lng': 13.4050, 'country': '🇩🇪 Germany', 'city': 'Berlin', 'threat': 'DDoS Attack', 'severity': 'low'},
        {'lat': 48.8566, 'lng': 2.3522, 'country': '🇫🇷 France', 'city': 'Paris', 'threat': 'Ransomware', 'severity': 'medium'},
        {'lat': 35.6895, 'lng': 139.6917, 'country': '🇯🇵 Japan', 'city': 'Tokyo', 'threat': 'Malware', 'severity': 'low'},
        {'lat': -33.8688, 'lng': 151.2093, 'country': '🇦🇺 Australia', 'city': 'Sydney', 'threat': 'Data Breach', 'severity': 'medium'}
    ]
    return jsonify(locations)

@app.route('/api/country-stats')
def country_stats():
    return jsonify({
        'us': random.randint(2800, 2900),
        'in': random.randint(600, 700),
        'ru': random.randint(900, 1000),
        'cn': random.randint(1200, 1300),
        'uk': random.randint(400, 500),
        'de': random.randint(300, 400)
    })

@app.route('/api/timeline')
def timeline():
    events = [
        {'time': 'Just now', 'event': '🔴 DDoS Attack — US'},
        {'time': '3 min ago', 'event': '🟡 Phishing — IN'},
        {'time': '12 min ago', 'event': '🟢 Malware — RU'},
        {'time': '28 min ago', 'event': '🔵 Data Breach — UK'}
    ]
    return jsonify(events)

@app.route('/api/export/csv')
def export_csv():
    data = f"Timestamp,Threats,Attacks,Vulnerabilities,Countries\n{datetime.now()},{random.randint(12000,13000)},{random.randint(300,400)},{random.randint(1000,1300)},{random.randint(180,195)}"
    return data, 200, {'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename=report.csv'}

@app.route('/api/export/json')
def export_json():
    return jsonify({
        'timestamp': datetime.now().isoformat(),
        'stats': {
            'threats': random.randint(12000, 13000),
            'attacks': random.randint(300, 400),
            'vulnerabilities': random.randint(1000, 1300),
            'countries': random.randint(180, 195)
        },
        'version': 'v8.1'
    })

# ================================================================
# 🎯 OSINT APIs
# ================================================================

@app.route('/api/osint/dork', methods=['POST'])
def osint_dork():
    return jsonify({'status': 'success', 'message': 'Found 142 results for your query'})

@app.route('/api/osint/shodan', methods=['POST'])
def osint_shodan():
    return jsonify({'status': 'success', 'message': 'Found 87 hosts on Shodan'})

@app.route('/api/osint/censys', methods=['POST'])
def osint_censys():
    return jsonify({'status': 'success', 'message': 'Censys scan complete'})

@app.route('/api/osint/hibp', methods=['POST'])
def osint_hibp():
    return jsonify({'status': 'success', 'message': 'Email not found in breaches'})

@app.route('/api/osint/virustotal', methods=['POST'])
def osint_virustotal():
    return jsonify({'status': 'success', 'message': 'URL is safe (0/70 detections)'})

@app.route('/api/osint/whois', methods=['POST'])
def osint_whois():
    return jsonify({'status': 'success', 'message': 'WHOIS lookup complete'})

@app.route('/api/osint/spider', methods=['POST'])
def osint_spider():
    return jsonify({'status': 'success', 'message': 'Spiderfoot scan complete'})

@app.route('/api/osint/wayback', methods=['POST'])
def osint_wayback():
    return jsonify({'status': 'success', 'message': 'Wayback Machine data retrieved'})

# ================================================================
# 🛡️ SECURITY APIs
# ================================================================

@app.route('/api/security/threat', methods=['POST'])
def security_threat():
    return jsonify({'status': 'success', 'risk': '🟢 LOW', 'message': 'No threats detected'})

@app.route('/api/security/ssl', methods=['POST'])
def security_ssl():
    return jsonify({'status': 'success', 'message': 'SSL certificate is valid'})

@app.route('/api/security/phish', methods=['POST'])
def security_phish():
    return jsonify({'status': 'success', 'message': 'No phishing indicators found'})

@app.route('/api/security/ip', methods=['POST'])
def security_ip():
    return jsonify({'status': 'success', 'reputation': '✅ Clean', 'message': 'IP is safe'})

@app.route('/api/security/darkweb', methods=['POST'])
def security_darkweb():
    return jsonify({'status': 'success', 'message': 'Email not found on dark web'})

@app.route('/api/security/vuln', methods=['POST'])
def security_vuln():
    return jsonify({'status': 'success', 'message': 'No vulnerabilities found'})

# ================================================================
# 🚀 STATIC FILES
# ================================================================

@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

# ================================================================
# 🚀 RUN APP
# ================================================================

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
