from flask import Flask, render_template, jsonify, send_from_directory
import os
import random

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

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
        '⚡ CRITICAL ZERO-DAY DISCOVERED IN VPN SOFTWARE',
        '🌐 GLOBAL CYBER ATTACK TARGETS FINANCIAL INSTITUTIONS',
        '🤖 AI-POWERED MALWARE DETECTED ACROSS 50+ COUNTRIES',
        '💀 RANSOMWARE GANG LEAKS 2TB CORPORATE DATA'
    ]
    return jsonify({'news': random.choice(news_list)})

@app.route('/api/osint/dork', methods=['POST'])
def dork():
    return jsonify({'status': 'success', 'message': '🔍 142 VULNERABILITIES FOUND'})

@app.route('/api/osint/shodan', methods=['POST'])
def shodan():
    return jsonify({'status': 'success', 'message': '🌐 87 HOSTS IDENTIFIED'})

@app.route('/api/security/threat', methods=['POST'])
def threat():
    return jsonify({'status': 'success', 'message': '🛡️ THREAT LEVEL: LOW'})

@app.route('/api/security/ssl', methods=['POST'])
def ssl():
    return jsonify({'status': 'success', 'message': '🔒 SSL CERTIFICATE: VALID'})

@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
