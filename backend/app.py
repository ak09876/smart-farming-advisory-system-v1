from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
import os
from dotenv import load_dotenv
from models import db, User, Farm, Plot, WeatherData, Advisory

load_dotenv()

app = Flask(__name__)
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///farming.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-secret-key')

db.init_app(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

# Create tables within application context
with app.app_context():
    db.create_all()

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "Smart Farming API is running"})

# Farm management endpoints
@app.route('/api/farms', methods=['GET', 'POST'])
def farms():
    if request.method == 'POST':
        data = request.get_json()
        farm = Farm(
            name=data['name'],
            location=data['location'],
            area_acres=data['area_acres'],
            soil_type=data.get('soil_type'),
            user_id=1  # Temporary - will use JWT user_id
        )
        db.session.add(farm)
        db.session.commit()
        return jsonify({'id': farm.id, 'message': 'Farm created successfully'}), 201
    
    farms = Farm.query.all()
    return jsonify([{
        'id': f.id,
        'name': f.name,
        'location': f.location,
        'area_acres': f.area_acres,
        'soil_type': f.soil_type
    } for f in farms])

@app.route('/api/farms/<int:farm_id>/plots', methods=['GET', 'POST'])
def farm_plots(farm_id):
    if request.method == 'POST':
        data = request.get_json()
        plot = Plot(
            name=data['name'],
            area_acres=data['area_acres'],
            current_crop=data.get('current_crop'),
            farm_id=farm_id
        )
        db.session.add(plot)
        db.session.commit()
        return jsonify({'id': plot.id, 'message': 'Plot created successfully'}), 201
    
    plots = Plot.query.filter_by(farm_id=farm_id).all()
    return jsonify([{
        'id': p.id,
        'name': p.name,
        'area_acres': p.area_acres,
        'current_crop': p.current_crop
    } for p in plots])

@app.route('/api/weather/<int:plot_id>', methods=['GET', 'POST'])
def weather_data(plot_id):
    if request.method == 'POST':
        data = request.get_json()
        weather = WeatherData(
            plot_id=plot_id,
            temperature=data['temperature'],
            humidity=data['humidity'],
            rainfall=data.get('rainfall', 0),
            wind_speed=data.get('wind_speed')
        )
        db.session.add(weather)
        db.session.commit()
        return jsonify({'message': 'Weather data recorded'}), 201
    
    weather = WeatherData.query.filter_by(plot_id=plot_id).order_by(WeatherData.recorded_at.desc()).first()
    if weather:
        return jsonify({
            'temperature': weather.temperature,
            'humidity': weather.humidity,
            'rainfall': weather.rainfall,
            'wind_speed': weather.wind_speed,
            'recorded_at': weather.recorded_at.isoformat()
        })
    return jsonify({'message': 'No weather data found'}), 404

@app.route('/api/advisories/<int:plot_id>', methods=['GET', 'POST'])
def advisories(plot_id):
    if request.method == 'POST':
        data = request.get_json()
        advisory = Advisory(
            plot_id=plot_id,
            title=data['title'],
            message=data['message'],
            priority=data.get('priority', 'medium'),
            category=data['category']
        )
        db.session.add(advisory)
        db.session.commit()
        return jsonify({'message': 'Advisory created'}), 201
    
    advisories = Advisory.query.filter_by(plot_id=plot_id).order_by(Advisory.created_at.desc()).all()
    return jsonify([{
        'id': a.id,
        'title': a.title,
        'message': a.message,
        'priority': a.priority,
        'category': a.category,
        'created_at': a.created_at.isoformat(),
        'is_read': a.is_read
    } for a in advisories])

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 4000))
    app.run(debug=True, host='0.0.0.0', port=port)