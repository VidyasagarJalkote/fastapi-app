from fastapi.testclient import TestClient
from app.main import app, items

client = TestClient(app)


def setup_function():
    items.clear()


def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


def test_ping():
    res = client.get("/ping")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


def test_list_items_empty():
    res = client.get("/api/items")
    assert res.status_code == 200
    assert res.json() == []


def test_create_and_get_item():
    payload = {"name": "Test Item", "description": "A demo item", "price": 19.99}
    res = client.post("/api/items", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "Test Item"
    assert data["price"] == 19.99
    item_id = data["id"]

    # Get single item
    res_get = client.get(f"/api/items/{item_id}")
    assert res_get.status_code == 200
    assert res_get.json()["id"] == item_id

    # List items
    res_list = client.get("/api/items")
    assert res_list.status_code == 200
    assert len(res_list.json()) == 1


def test_update_item():
    payload = {"name": "Item 1", "description": "Original", "price": 10.0}
    res = client.post("/api/items", json=payload)
    item_id = res.json()["id"]

    update_payload = {"name": "Item 1 Updated", "description": "Updated desc", "price": 15.5}
    res_put = client.put(f"/api/items/{item_id}", json=update_payload)
    assert res_put.status_code == 200
    assert res_put.json()["name"] == "Item 1 Updated"
    assert res_put.json()["price"] == 15.5


def test_delete_item():
    payload = {"name": "To Delete", "description": "Desc", "price": 5.0}
    res = client.post("/api/items", json=payload)
    item_id = res.json()["id"]

    res_del = client.delete(f"/api/items/{item_id}")
    assert res_del.status_code == 204

    res_get = client.get(f"/api/items/{item_id}")
    assert res_get.status_code == 404


def test_frontend_served():
    res = client.get("/")
    assert res.status_code == 200
