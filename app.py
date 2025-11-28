# app.py

from flask import Flask, render_template, jsonify
from flask_cors import CORS
from config.settings import SECRET_KEY, DEBUG_MODE
from db.mongo_client import db

# Initialize Flask
app = Flask(__name__)
app.secret_key = SECRET_KEY
CORS(app)

# -----------------------------
# Register Blueprints
# -----------------------------
from routes.auth_routes import auth_bp
from routes.chatbot_routes import chatbot_bp
from routes.dashboard_routes import dashboard_bp
from routes.health_tracker import health_tracker_bp

app.register_blueprint(dashboard_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(chatbot_bp)
app.register_blueprint(health_tracker_bp)



# -----------------------------
# Default / Landing Route
# -----------------------------
@app.route("/")
def home():
    return render_template("index.html")

# Health Check Route
@app.route("/ping")
def ping():
    try:
        if db is not None:
            db.list_collection_names()  # Quick check
            return jsonify({"status": "OK", "db": "connected"}), 200
        else:
            return jsonify({"status": "ERROR", "db": "not connected"}), 500
    except Exception as e:
        return jsonify({"status": "ERROR", "message": str(e)}), 500


if __name__ == "__main__":
    # Start Medication Reminder Service
    from services.medication_reminder_service import start_reminder_service
    start_reminder_service()
    app.run(debug=DEBUG_MODE)