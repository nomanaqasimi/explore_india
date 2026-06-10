from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from extensions import db             # 1. Import your SQLAlchemy extension
from config import Config             # 2. Import your new central configuration class
from auth import register_user, login_user, logout_user, get_user_from_token

app = Flask(__name__)

# 3. Load all settings (SESSION_DURATION_DAYS, CORS_ORIGINS, SQLALCHEMY_DATABASE_URI) from Config
app.config.from_object(Config)

# 4. Apply CORS using settings from the configuration class
CORS(app, supports_credentials=True, origins=app.config['CORS_ORIGINS'])

# 5. Connect SQLAlchemy to your Flask server
db.init_app(app)

# 6. Automatically generate your SQLite .db file and tables when the server launches
with app.app_context():
    db.create_all()


# ── HELPER: read token from cookie ───────────────────────────
def get_token():
    return request.cookies.get("session_token")


# ── REGISTER ─────────────────────────────────────────────────
@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    full_name = data.get("full_name", "").strip()
    email     = data.get("email", "").strip().lower()
    password  = data.get("password", "")
    confirm   = data.get("confirm_password", "")

    # Basic validation
    if not all([full_name, email, password]):
        return jsonify({"success": False, "message": "All fields are required"}), 400

    if len(password) < 6:
        return jsonify({"success": False, "message": "Password must be at least 6 characters"}), 400

    if password != confirm:
        return jsonify({"success": False, "message": "Passwords do not match"}), 400

    success, message = register_user(full_name, email, password)

    if success:
        return jsonify({"success": True, "message": message}), 201
    else:
        return jsonify({"success": False, "message": message}), 409


# ── LOGIN ─────────────────────────────────────────────────────
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email       = data.get("email", "").strip().lower()
    password    = data.get("password", "")
    remember_me = data.get("remember_me", False)

    if not email or not password:
        return jsonify({"success": False, "message": "Email and password are required"}), 400

    success, result, user = login_user(email, password, remember_me)

    if not success:
        return jsonify({"success": False, "message": result}), 401

    # Set session cookie
    response = make_response(
        jsonify({"success": True, "message": "Login successful", "user": user})
    )
    
    # 7. Read SESSION_DURATION_DAYS using app.config instead of a direct import
    duration_days = app.config['SESSION_DURATION_DAYS']
    max_age = duration_days * 24 * 60 * 60 if remember_me else None
    
    response.set_cookie(
        "session_token",
        result,
        httponly=True,    # JS cannot read this cookie (security)
        samesite="Lax",
        max_age=max_age
    )
    return response, 200


# ── LOGOUT ────────────────────────────────────────────────────
@app.route("/logout", methods=["POST"])
def logout():
    token = get_token()
    if token:
        logout_user(token)

    response = make_response(
        jsonify({"success": True, "message": "Logged out"})
    )
    response.delete_cookie("session_token")
    return response, 200


# ── CHECK SESSION (for frontend to verify login state) ────────
@app.route("/me", methods=["GET"])
def me():
    token = get_token()
    if not token:
        return jsonify({"logged_in": False}), 401

    user = get_user_from_token(token)
    if not user:
        return jsonify({"logged_in": False}), 401

    return jsonify({"logged_in": True, "user": user}), 200


if __name__ == "__main__":
    app.run(debug=True, port=5000)