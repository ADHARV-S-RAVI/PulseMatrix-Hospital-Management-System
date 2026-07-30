from flask import Flask, jsonify
from flask_cors import CORS
import os

# Load environment variables from .env if present
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# Import blueprints
from routes.auth_routes import auth_bp
from routes.patient_routes import patient_bp
from routes.doctor_routes import doctor_bp
from routes.bed_routes import bed_bp
from routes.analytics_routes import analytics_bp
from routes.engine_routes import engine_bp
from routes.ambulance_routes import ambulance_bp
from routes.clinical_routes import clinical_bp
from routes.operations_routes import operations_bp
from routes.notification_routes import notification_bp
from routes.ai_routes import ai_bp

def create_app():
    app = Flask(__name__)
    
    # Enable CORS for frontend integration
    CORS(app)
    
    # Register Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(patient_bp)
    app.register_blueprint(doctor_bp)
    app.register_blueprint(bed_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(engine_bp)
    app.register_blueprint(ambulance_bp)
    app.register_blueprint(clinical_bp)
    app.register_blueprint(operations_bp)
    app.register_blueprint(notification_bp)
    app.register_blueprint(ai_bp)
    
    # Global error handler
    @app.errorhandler(Exception)
    def handle_exception(e):
        # Basic error handling for production-like structure
        return jsonify({"error": str(e)}), 500
    
    @app.route('/')
    def index():
        return jsonify({
            "message": "Welcome to Smart Hospital Emergency Management API",
            "version": "1.0.0",
            "endpoints": [
                "/login",
                "/patients",
                "/doctors",
                "/beds",
                "/analytics/total_patients",
                "/engine/emergency_queue",
                "/engine/dashboard_summary"
            ]
        })

    return app

if __name__ == "__main__":
    app = create_app()
    # Run server
    print("Starting Smart Hospital Backend Server...")
    app.run(debug=True, port=5001)
