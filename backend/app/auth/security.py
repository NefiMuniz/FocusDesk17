from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Generates a secure Bcrypt hash for a new user's password.
def get_password_hash(password: str) -> str:
  return pwd_context.hash(password)

# Validates a login attempt by comparing the provided password with the stored hash.
def verify_password(plain_password: str, hashed_password: str) -> bool:
  return pwd_context.verify(plain_password, hashed_password)