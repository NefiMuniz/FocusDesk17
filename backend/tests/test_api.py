from fastapi.testclient import TestClient
from app.main import app
import uuid

client = TestClient(app)

# HELPERS
def create_user_and_token():
    unique_id = uuid.uuid4().hex[:8]
    payload = {
        "email": f"user_{unique_id}@test.com",
        "password": "Test1234!",
        "name": "Test User"
    }

    client.post("/api/auth/register", json=payload)

    response = client.post("/api/auth/login", data={
        "username": payload["email"],
        "password": payload["password"]
    })

    token = response.json()["access_token"]

    return {
        "headers": {"Authorization": f"Bearer {token}"}
    }


# =========================
# BOARDS
# =========================

def test_create_and_get_boards():
    auth = create_user_and_token()

    # Create board
    payload = {"name": "My Board", "description": "Test"}
    res = client.post("/api/boards/", json=payload, headers=auth["headers"])
    assert res.status_code == 201

    board = res.json()
    assert board["name"] == "My Board"

    # Get boards
    res = client.get("/api/boards/", headers=auth["headers"])
    assert res.status_code == 200
    assert len(res.json()) >= 1


def test_get_single_board():
    auth = create_user_and_token()

    payload = {"name": "Board 1"}
    res = client.post("/api/boards/", json=payload, headers=auth["headers"])
    board_id = res.json()["id"]

    res = client.get(f"/api/boards/{board_id}", headers=auth["headers"])
    assert res.status_code == 200
    assert res.json()["id"] == board_id


def test_update_board():
    auth = create_user_and_token()

    res = client.post("/api/boards/", json={"name": "Old"}, headers=auth["headers"])
    board_id = res.json()["id"]

    res = client.patch(
        f"/api/boards/{board_id}",
        json={"name": "Updated"},
        headers=auth["headers"]
    )
    assert res.status_code == 200
    assert res.json()["name"] == "Updated"


def test_delete_board():
    auth = create_user_and_token()

    res = client.post("/api/boards/", json={"name": "ToDelete"}, headers=auth["headers"])
    board_id = res.json()["id"]

    res = client.delete(f"/api/boards/{board_id}", headers=auth["headers"])
    assert res.status_code == 204

# =========================
# LABELS
# =========================

def test_create_and_get_labels():
    auth = create_user_and_token()

    payload = {"name": "Urgent", "color": "#FF0000"}
    res = client.post("/api/labels/", json=payload, headers=auth["headers"])
    assert res.status_code == 201

    res = client.get("/api/labels/", headers=auth["headers"])
    assert res.status_code == 200
    assert len(res.json()) >= 1


def test_update_label():
    auth = create_user_and_token()

    res = client.post("/api/labels/", json={"name": "Bug"}, headers=auth["headers"])
    label_id = res.json()["id"]

    res = client.patch(
        f"/api/labels/{label_id}",
        json={"name": "Feature"},
        headers=auth["headers"]
    )
    assert res.status_code == 200
    assert res.json()["name"] == "Feature"


def test_delete_label():
    auth = create_user_and_token()

    res = client.post("/api/labels/", json={"name": "Temp"}, headers=auth["headers"])
    label_id = res.json()["id"]

    res = client.delete(f"/api/labels/{label_id}", headers=auth["headers"])
    assert res.status_code == 204

# =========================
# LISTS
# =========================

def create_board(auth):
    res = client.post("/api/boards/", json={"name": "Board"}, headers=auth["headers"])
    return res.json()["id"]

def test_create_and_get_lists():
    auth = create_user_and_token()
    board_id = create_board(auth)

    res = client.post(
        f"/api/boards/{board_id}/lists/",
        json={"name": "Todo"},
        headers=auth["headers"]
    )
    assert res.status_code == 201

    res = client.get(
        f"/api/boards/{board_id}/lists/",
        headers=auth["headers"]
    )
    assert res.status_code == 200
    assert len(res.json()) >= 1


def test_update_list():
    auth = create_user_and_token()
    board_id = create_board(auth)

    res = client.post(
        f"/api/boards/{board_id}/lists/",
        json={"name": "Old"},
        headers=auth["headers"]
    )
    list_id = res.json()["id"]

    res = client.patch(
        f"/api/lists/{list_id}",
        json={"name": "New"},
        headers=auth["headers"]
    )
    assert res.status_code == 200


def test_delete_list():
    auth = create_user_and_token()
    board_id = create_board(auth)

    res = client.post(
        f"/api/boards/{board_id}/lists/",
        json={"name": "Delete"},
        headers=auth["headers"]
    )
    list_id = res.json()["id"]

    res = client.delete(f"/api/lists/{list_id}", headers=auth["headers"])
    assert res.status_code == 204

# =========================
# TASKS
# =========================

def create_list(auth):
    board_id = create_board(auth)
    res = client.post(
        f"/api/boards/{board_id}/lists/",
        json={"name": "List"},
        headers=auth["headers"]
    )
    return res.json()["id"]

def test_create_and_get_tasks():
    auth = create_user_and_token()
    list_id = create_list(auth)

    res = client.post(
        f"/api/lists/{list_id}/tasks/",
        json={"title": "Task 1"},
        headers=auth["headers"]
    )
    assert res.status_code == 201

    res = client.get(
        f"/api/lists/{list_id}/tasks/",
        headers=auth["headers"]
    )
    assert res.status_code == 200
    assert len(res.json()) >= 1


def test_update_task():
    auth = create_user_and_token()
    list_id = create_list(auth)

    res = client.post(
        f"/api/lists/{list_id}/tasks/",
        json={"title": "Old"},
        headers=auth["headers"]
    )
    task_id = res.json()["id"]

    res = client.patch(
        f"/api/tasks/{task_id}",
        json={"title": "Updated"},
        headers=auth["headers"]
    )
    assert res.status_code == 200
    assert res.json()["title"] == "Updated"


def test_delete_task():
    auth = create_user_and_token()
    list_id = create_list(auth)

    res = client.post(
        f"/api/lists/{list_id}/tasks/",
        json={"title": "Delete"},
        headers=auth["headers"]
    )
    task_id = res.json()["id"]

    res = client.delete(f"/api/tasks/{task_id}", headers=auth["headers"])
    assert res.status_code == 204


def test_reorder_task():
    auth = create_user_and_token()
    list_id = create_list(auth)

    res = client.post(
        f"/api/lists/{list_id}/tasks/",
        json={"title": "Task"},
        headers=auth["headers"]
    )
    task_id = res.json()["id"]

    res = client.patch(
        f"/api/tasks/{task_id}/reorder",
        json={"new_list_id": list_id, "new_position": 0},
        headers=auth["headers"]
    )
    assert res.status_code == 200

# =========================
#  SECURITY TEST
# =========================

def test_access_without_token():
    res = client.get("/api/boards/")
    assert res.status_code == 401
