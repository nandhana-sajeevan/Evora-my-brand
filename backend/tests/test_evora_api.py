"""Backend API tests for ÉVORA e-commerce."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL") or "https://premium-streetwear-34.preview.emergentagent.com"
BASE_URL = BASE_URL.rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@evora.com"
ADMIN_PASS = "Evora@2026"
TEST_EMAIL = "test@evora.com"
TEST_PASS = "Test@1234"


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------------- Health ----------------
def test_health_root(session):
    r = session.get(f"{API}/")
    assert r.status_code == 200
    assert "ÉVORA" in r.json().get("message", "") or "EVORA" in r.json().get("message", "").upper()


# ---------------- Categories ----------------
def test_categories(session):
    r = session.get(f"{API}/categories")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) == 5
    slugs = {c["slug"] for c in data}
    assert {"oversized-tees", "hoodies", "jackets", "streetwear", "accessories"} == slugs


# ---------------- Products ----------------
def test_products_list(session):
    r = session.get(f"{API}/products")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 12
    p = data[0]
    for k in ["id", "name", "price", "category", "images", "sizes", "rating"]:
        assert k in p
    assert "_id" not in p


def test_products_filter_category(session):
    r = session.get(f"{API}/products", params={"category": "Hoodies"})
    assert r.status_code == 200
    for p in r.json():
        assert p["category"] == "Hoodies"


def test_products_filter_trending(session):
    r = session.get(f"{API}/products", params={"trending": "true"})
    assert r.status_code == 200
    data = r.json()
    assert len(data) > 0
    for p in data:
        assert p["is_trending"] is True


def test_products_filter_is_new(session):
    r = session.get(f"{API}/products", params={"is_new": "true"})
    assert r.status_code == 200
    for p in r.json():
        assert p["is_new"] is True


def test_products_sort_price_asc(session):
    r = session.get(f"{API}/products", params={"sort": "price_asc"})
    prices = [p["price"] for p in r.json()]
    assert prices == sorted(prices)


def test_products_sort_price_desc(session):
    r = session.get(f"{API}/products", params={"sort": "price_desc"})
    prices = [p["price"] for p in r.json()]
    assert prices == sorted(prices, reverse=True)


def test_products_search(session):
    r = session.get(f"{API}/products", params={"search": "Tee"})
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 1
    assert any("tee" in p["name"].lower() for p in data)


def test_product_by_id(session):
    r = session.get(f"{API}/products")
    pid = r.json()[0]["id"]
    r2 = session.get(f"{API}/products/{pid}")
    assert r2.status_code == 200
    assert r2.json()["id"] == pid


def test_product_not_found(session):
    r = session.get(f"{API}/products/{uuid.uuid4()}")
    assert r.status_code == 404


# ---------------- Auth ----------------
def test_admin_login(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS})
    assert r.status_code == 200, r.text
    data = r.json()
    assert "token" in data and len(data["token"]) > 20
    assert data["user"]["email"] == ADMIN_EMAIL
    assert data["user"]["role"] == "admin"
    # cookie set
    assert "access_token" in r.cookies or any("access_token" in c.name for c in r.cookies)


def test_register_or_login_test_user(session):
    # Try register, if 400 -> already exists -> login
    r = session.post(f"{API}/auth/register", json={
        "email": TEST_EMAIL, "password": TEST_PASS, "name": "Test User"
    })
    assert r.status_code in (200, 400), r.text
    if r.status_code == 400:
        r = session.post(f"{API}/auth/login", json={"email": TEST_EMAIL, "password": TEST_PASS})
        assert r.status_code == 200, r.text


def test_login_invalid(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrongpassword"})
    assert r.status_code == 401


def test_me_requires_auth(session):
    r = requests.get(f"{API}/auth/me")
    assert r.status_code == 401


# Shared auth fixture for cart/wishlist tests
@pytest.fixture(scope="session")
def auth_session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    # Ensure user
    s.post(f"{API}/auth/register", json={"email": TEST_EMAIL, "password": TEST_PASS, "name": "Test User"})
    r = s.post(f"{API}/auth/login", json={"email": TEST_EMAIL, "password": TEST_PASS})
    assert r.status_code == 200
    token = r.json()["token"]
    s.headers.update({"Authorization": f"Bearer {token}"})
    return s


def test_me_with_token(auth_session):
    r = auth_session.get(f"{API}/auth/me")
    assert r.status_code == 200, r.text
    assert r.json()["email"] == TEST_EMAIL


def test_logout(auth_session):
    r = auth_session.post(f"{API}/auth/logout")
    assert r.status_code == 200


# ---------------- Cart ----------------
@pytest.fixture(scope="session")
def product_id(session):
    r = session.get(f"{API}/products")
    return r.json()[0]["id"]


def test_cart_full_flow(auth_session, product_id):
    # Clear existing cart items first
    existing = auth_session.get(f"{API}/cart").json()
    for it in existing:
        auth_session.delete(f"{API}/cart/{it['id']}")

    # ADD
    r = auth_session.post(f"{API}/cart", json={"product_id": product_id, "quantity": 2, "size": "M"})
    assert r.status_code == 200, r.text
    item_id = r.json()["id"]

    # GET enriched
    r = auth_session.get(f"{API}/cart")
    assert r.status_code == 200
    items = r.json()
    assert len(items) >= 1
    target = next(i for i in items if i["id"] == item_id)
    assert target["quantity"] == 2
    assert target["size"] == "M"
    assert "product" in target and target["product"]["id"] == product_id

    # ADD same product+size -> increment
    r = auth_session.post(f"{API}/cart", json={"product_id": product_id, "quantity": 1, "size": "M"})
    assert r.status_code == 200
    items = auth_session.get(f"{API}/cart").json()
    target = next(i for i in items if i["id"] == item_id)
    assert target["quantity"] == 3

    # PUT update
    r = auth_session.put(f"{API}/cart/{item_id}", json={"quantity": 5})
    assert r.status_code == 200
    items = auth_session.get(f"{API}/cart").json()
    assert next(i for i in items if i["id"] == item_id)["quantity"] == 5

    # DELETE
    r = auth_session.delete(f"{API}/cart/{item_id}")
    assert r.status_code == 200
    items = auth_session.get(f"{API}/cart").json()
    assert not any(i["id"] == item_id for i in items)


def test_cart_requires_auth():
    r = requests.get(f"{API}/cart")
    assert r.status_code == 401


# ---------------- Wishlist ----------------
def test_wishlist_flow(auth_session, product_id):
    # cleanup
    existing = auth_session.get(f"{API}/wishlist").json()
    for it in existing:
        auth_session.delete(f"{API}/wishlist/{it['product_id']}")

    # ADD
    r = auth_session.post(f"{API}/wishlist", json={"product_id": product_id})
    assert r.status_code == 200
    wid1 = r.json()["id"]

    # GET enriched
    items = auth_session.get(f"{API}/wishlist").json()
    assert len(items) == 1
    assert items[0]["product"]["id"] == product_id

    # Idempotent ADD
    r = auth_session.post(f"{API}/wishlist", json={"product_id": product_id})
    assert r.status_code == 200
    assert r.json()["id"] == wid1
    items = auth_session.get(f"{API}/wishlist").json()
    assert len(items) == 1

    # DELETE
    r = auth_session.delete(f"{API}/wishlist/{product_id}")
    assert r.status_code == 200
    assert auth_session.get(f"{API}/wishlist").json() == []


# ---------------- Newsletter ----------------
def test_newsletter_subscribe_and_dedupe(session):
    email = f"test_{uuid.uuid4().hex[:8]}@evora.com"
    r = session.post(f"{API}/newsletter", json={"email": email})
    assert r.status_code == 200
    assert r.json()["already_subscribed"] is False

    r = session.post(f"{API}/newsletter", json={"email": email})
    assert r.status_code == 200
    assert r.json()["already_subscribed"] is True
