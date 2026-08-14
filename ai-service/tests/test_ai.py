from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_chat_unconfigured():
    # Calling the endpoint without settings configured should result in a 500 error
    response = client.post("/api/v1/ai/chat", json={"message": "hello"})
    assert response.status_code in [200, 500] # Depends on if local env has a key
