from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "Smart Farming API is running"})

@app.route('/api/crops', methods=['GET'])
def get_crops():
    crops = [
        {"id": 1, "name": "Tomato", "season": "Summer", "water_needs": "High"},
        {"id": 2, "name": "Wheat", "season": "Winter", "water_needs": "Medium"},
        {"id": 3, "name": "Rice", "season": "Monsoon", "water_needs": "High"}
    ]
    return jsonify(crops)

@app.route('/api/weather', methods=['GET'])
def get_weather():
    weather = {
        "temperature": 25,
        "humidity": 65,
        "rainfall": 12,
        "conditions": "Partly Cloudy"
    }
    return jsonify(weather)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 4000))
    app.run(debug=True, host='0.0.0.0', port=port)