from app.database import SessionLocal
from app.models import User
from app.auth.security import get_password_hash, verify_password, create_access_token, SECRET_KEY, ALGORITHM
from jose import jwt


from dotenv import load_dotenv
load_dotenv()

import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)

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
    db = SessionLocal()

    email = "perico@entel.cl"
    password = "Secret@123"

    # Find real user in database
    user = db.query(User).filter(User.email == email).first()

    assert user is not None, "User does not exist in DB"

    # Check real password
    assert verify_password(password, user.password_hash), "Wrong password"

    # Create token
    token = create_access_token({"sub": user.email})

    assert token is not None

    # Decode JWT
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

    assert payload["sub"] == email
    assert "exp" in payload

    db.close()


