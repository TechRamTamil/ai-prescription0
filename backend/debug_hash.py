from passlib.context import CryptContext
import traceback

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

try:
    password = "password123"
    print(f"Attempting to hash: {password}")
    hashed = pwd_context.hash(password)
    print(f"Hashed: {hashed}")
except Exception as e:
    print(f"Error: {e}")
    traceback.print_exc()
