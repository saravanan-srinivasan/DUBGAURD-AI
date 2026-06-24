import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "Welcome" in response.json()["message"]

def test_evaluate_dubbing_missing_files():
    # If we post without required files, it should fail 422 Validation Error
    response = client.post(
        f"{settings.API_V1_STR}/evaluate-dubbing", 
        data={"original_transcript": "hi"}
    )
    assert response.status_code == 422
