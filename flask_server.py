from flask import Flask, send_from_directory, jsonify
import os

# Initialize Flask app
# We set template and static folders to the current directory for simplicity
app = Flask(__name__, static_folder='.', template_folder='.')

@app.route('/')
def index():
    """Serves the main World Cup Tea HTML page."""
    return send_from_directory(os.getcwd(), 'world_cup_query.html')

@app.route('/api/tea')
def get_tea():
    """API endpoint providing the 'tea' data directly from Python."""
    return jsonify({
        "title": "POV: Pan-Africanism left the chat 💀",
        "items": [
            {"icon": "✈️", "label": "Send Backs?", "text": "No Cheers. 🚫"},
            {"icon": "🇳🇬", "label": "New Faves:", "text": "Nigeria & Senegal! ⚡"},
            {"icon": "📉", "label": "Ratioed:", "text": "Respect is a 2-way street. 🤝"}
        ],
        "footer": "RECIPROCITY ONLY! 🔥💯"
    })

@app.route('/<path:path>')
def serve_static(path):
    """Serves JS, CSS, and other assets."""
    return send_from_directory(os.getcwd(), path)

if __name__ == '__main__':
    print("*" * 40)
    print("🚀 TikTok Tea Server Starting!")
    print("🔗 View it at: http://127.0.0.1:5000")
    print("*" * 40)
    # Run the app
    app.run(debug=True, port=5000)