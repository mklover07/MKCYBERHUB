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
    news_list = ['Critical zero-day vulnerability discovered', 'Global cyber attack targets institutions', 'New AI-powered malware detected']
    return jsonify({'news': random.choice(news_list)})

@app.route('/api/map-data')
def map_data():
    locations = [
        {'lat': 40.7128, 'lng': -74.0060, 'country': '🇺🇸 USA', 'city': 'New York', 'threat': 'DDOS Attack', 'severity': 'high'},
        {'lat': 28.6139, 'lng': 77.2090, 'country': '🇮🇳 India', 'city': 'Delhi', 'threat': 'Phishing', 'severity': 'medium'},
        {'lat': 55.7558, 'lng': 37.6173, 'country': '🇷🇺 Russia', 'city': 'Moscow', 'threat': 'Ransomware', 'severity': 'high'}
    ]
    return jsonify(locations)

@app.route('/api/timeline')
def timeline():
    events = [
        {'time': 'Just now', 'event': '🔴 DDoS Attack — US'},
        {'time': '3 min ago', 'event': '🟡 Phishing — IN'},
        {'time': '12 min ago', 'event': '🟢 Malware — RU'}
    ]
    return jsonify(events)

@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
