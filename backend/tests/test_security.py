from fastapi.testclient import TestClient
from app.main import app
import uuid
from app.database import SessionLocal
from app.models import User
from app.auth.security import get_password_hash, verify_password, create_access_token, SECRET_KEY, ALGORITHM
from jose import jwt


from dotenv import load_dotenv
load_dotenv()

import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)



client = TestClient(app)


def generate_unique_user():
    unique_id = uuid.uuid4().hex[:8]
    return {
        "email": f"user_{unique_id}@test.com",
        "password": "Test1234!",
        "name": "Test User"
    }


def test_register_user_success():
    payload = generate_unique_user()
    
    response = client.post("/api/auth/register", json=payload)

    assert response.status_code == 201
    data = response.json()

    assert data["email"] == payload["email"]
    assert "id" in data


def test_login_after_register():
    payload = generate_unique_user()

    # Register
    register_response = client.post("/api/auth/register", json=payload)
    assert register_response.status_code == 201

    # Login (form-data)
    login_data = {
        "username": payload["email"],
        "password": payload["password"]
    }

    response = client.post("/api/auth/login", data=login_data)

    assert response.status_code == 200

    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_get_password_hash_returns_hashed_value():
    password = "mypassword123"
    hashed = get_password_hash(password)

    assert hashed != password
    assert isinstance(hashed, str)

def test_verify_password_success():
    password = "mypassword123"
    hashed = get_password_hash(password)

    assert verify_password(password, hashed) is True

def test_verify_password_failure():
    password = "mypassword123"
    hashed = get_password_hash(password)

    assert verify_password("wrongpassword", hashed) is False

def test_create_access_token_contains_sub():
    token = create_access_token({"sub": "test@example.com"})
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

    assert payload["sub"] == "test@example.com"
    assert "exp" in payload




def test_login_real_user():
    payload = generate_unique_user()

    # Register user
    register_response = client.post("/api/auth/register", json=payload)
    assert register_response.status_code == 201

    db = SessionLocal()

    user = db.query(User).filter(User.email == payload["email"]).first()

    assert user is not None

    assert verify_password(payload["password"], user.password_hash)

    token = create_access_token({"sub": user.email})
    assert token is not None

    db.close()

