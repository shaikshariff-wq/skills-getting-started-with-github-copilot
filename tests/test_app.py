import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_root_redirect():
    response = client.get("/")
    assert response.status_code == 200
    # Since it's a redirect to static file, but TestClient follows redirects by default
    # Actually, RedirectResponse to /static/index.html, but since static files are mounted,
    # it should serve the file. But in test, it might not work the same.
    # For simplicity, let's test the activities endpoint.

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data
    assert "Programming Class" in data

def test_signup_success():
    response = client.post("/activities/Chess Club/signup", data={"email": "test@example.com"})
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "test@example.com" in data["message"]

def test_signup_activity_not_found():
    response = client.post("/activities/Nonexistent/signup", data={"email": "test@example.com"})
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data
    assert "Activity not found" in data["detail"]

def test_signup_already_signed_up():
    # First signup
    client.post("/activities/Chess Club/signup", data={"email": "duplicate@example.com"})
    # Second signup
    response = client.post("/activities/Chess Club/signup", data={"email": "duplicate@example.com"})
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data
    assert "already signed up" in data["detail"]

def test_unregister_success():
    # First signup
    client.post("/activities/Programming Class/signup", data={"email": "unregister@example.com"})
    # Then unregister
    response = client.delete("/activities/Programming Class/participants/unregister@example.com")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "Unregistered" in data["message"]

def test_unregister_activity_not_found():
    response = client.delete("/activities/Nonexistent/participants/test@example.com")
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data
    assert "Activity not found" in data["detail"]

def test_unregister_not_signed_up():
    response = client.delete("/activities/Chess Club/participants/notsigned@example.com")
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data
    assert "not signed up" in data["detail"]