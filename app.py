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
        'Critical zero-day vulnerability discovered in VPN software',
        'Global cyber attack targets financial institutions',
        'New AI-powered malware detected across 50+ countries'
    ]
    return jsonify({'news': random.choice(news_list)})

@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
