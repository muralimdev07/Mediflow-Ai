from app.core.security import create_access_token, verify_token, hash_password, verify_password

def test_jwt_creation_and_verification():
    token = create_access_token({"sub": "user_123", "role": "patient"})
    payload = verify_token(token, token_type="access")
    assert payload is not None
    assert payload["sub"] == "user_123"
    assert payload["role"] == "patient"

def test_password_hashing():
    pwd = "secret_password"
    hashed = hash_password(pwd)
    assert verify_password(pwd, hashed) is True
    assert verify_password("wrong_password", hashed) is False
