from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import logging
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr


# ---------------------------------------------------------------------------
# DB
# ---------------------------------------------------------------------------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(title="ÉVORA API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------
JWT_ALGORITHM = "HS256"


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "access",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------
class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1, max_length=80)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str


class Product(BaseModel):
    id: str
    name: str
    slug: str
    price: float
    original_price: Optional[float] = None
    category: str
    description: str
    images: List[str]
    sizes: List[str]
    colors: List[str]
    rating: float
    reviews_count: int
    in_stock: bool
    is_new: bool = False
    is_trending: bool = False


class CartAddIn(BaseModel):
    product_id: str
    quantity: int = Field(default=1, ge=1, le=99)
    size: Optional[str] = None


class CartUpdateIn(BaseModel):
    quantity: int = Field(ge=1, le=99)


class WishlistAddIn(BaseModel):
    product_id: str


class NewsletterIn(BaseModel):
    email: EmailStr


# ---------------------------------------------------------------------------
# Routes — Auth
# ---------------------------------------------------------------------------
def _set_auth_cookie(response: Response, token: str):
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=60 * 60 * 24 * 7,
        path="/",
    )


@api_router.post("/auth/register", response_model=UserOut)
async def register(payload: RegisterIn, response: Response):
    email = payload.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = {
        "id": str(uuid.uuid4()),
        "email": email,
        "name": payload.name,
        "password_hash": hash_password(payload.password),
        "role": "user",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(user)
    token = create_access_token(user["id"], user["email"])
    _set_auth_cookie(response, token)
    return UserOut(id=user["id"], email=user["email"], name=user["name"], role=user["role"])


@api_router.post("/auth/login")
async def login(payload: LoginIn, response: Response):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"], user["email"])
    _set_auth_cookie(response, token)
    return {
        "user": UserOut(id=user["id"], email=user["email"], name=user["name"], role=user["role"]),
        "token": token,
    }


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token", path="/")
    return {"ok": True}


@api_router.get("/auth/me", response_model=UserOut)
async def me(user: dict = Depends(get_current_user)):
    return UserOut(**user)


# ---------------------------------------------------------------------------
# Routes — Products
# ---------------------------------------------------------------------------
@api_router.get("/products", response_model=List[Product])
async def list_products(
    category: Optional[str] = None,
    sort: Optional[str] = None,
    search: Optional[str] = None,
    trending: Optional[bool] = None,
    is_new: Optional[bool] = None,
):
    query: dict = {}
    if category and category.lower() != "all":
        query["category"] = category
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    if trending is not None:
        query["is_trending"] = trending
    if is_new is not None:
        query["is_new"] = is_new

    cursor = db.products.find(query, {"_id": 0})
    products = await cursor.to_list(500)

    if sort == "price_asc":
        products.sort(key=lambda p: p["price"])
    elif sort == "price_desc":
        products.sort(key=lambda p: -p["price"])
    elif sort == "rating":
        products.sort(key=lambda p: -p["rating"])
    elif sort == "newest":
        products.sort(key=lambda p: not p["is_new"])
    return products


@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@api_router.get("/categories")
async def list_categories():
    return [
        {"name": "Oversized Tees", "slug": "oversized-tees", "image": "https://images.unsplash.com/photo-1642400997435-f4b7c0f68ce9"},
        {"name": "Hoodies", "slug": "hoodies", "image": "https://images.unsplash.com/photo-1618924250113-e162305ac8cd"},
        {"name": "Jackets", "slug": "jackets", "image": "https://images.unsplash.com/photo-1615545362149-85299994b09b"},
        {"name": "Streetwear", "slug": "streetwear", "image": "https://images.pexels.com/photos/25745247/pexels-photo-25745247.jpeg"},
        {"name": "Accessories", "slug": "accessories", "image": "https://images.unsplash.com/photo-1628065124175-32d9e33b898b"},
    ]


# ---------------------------------------------------------------------------
# Routes — Cart
# ---------------------------------------------------------------------------
@api_router.get("/cart")
async def get_cart(user: dict = Depends(get_current_user)):
    items = await db.cart.find({"user_id": user["id"]}, {"_id": 0}).to_list(500)
    # enrich with product data
    enriched = []
    for item in items:
        product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
        if product:
            enriched.append({**item, "product": product})
    return enriched


@api_router.post("/cart")
async def add_to_cart(payload: CartAddIn, user: dict = Depends(get_current_user)):
    product = await db.products.find_one({"id": payload.product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    existing = await db.cart.find_one({
        "user_id": user["id"], "product_id": payload.product_id, "size": payload.size,
    })
    if existing:
        await db.cart.update_one(
            {"id": existing["id"]},
            {"$inc": {"quantity": payload.quantity}},
        )
        return {"ok": True, "id": existing["id"]}
    item = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "product_id": payload.product_id,
        "quantity": payload.quantity,
        "size": payload.size,
        "added_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.cart.insert_one(item)
    return {"ok": True, "id": item["id"]}


@api_router.put("/cart/{item_id}")
async def update_cart(item_id: str, payload: CartUpdateIn, user: dict = Depends(get_current_user)):
    result = await db.cart.update_one(
        {"id": item_id, "user_id": user["id"]},
        {"$set": {"quantity": payload.quantity}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Cart item not found")
    return {"ok": True}


@api_router.delete("/cart/{item_id}")
async def delete_cart(item_id: str, user: dict = Depends(get_current_user)):
    result = await db.cart.delete_one({"id": item_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cart item not found")
    return {"ok": True}


# ---------------------------------------------------------------------------
# Routes — Wishlist
# ---------------------------------------------------------------------------
@api_router.get("/wishlist")
async def get_wishlist(user: dict = Depends(get_current_user)):
    items = await db.wishlist.find({"user_id": user["id"]}, {"_id": 0}).to_list(500)
    enriched = []
    for item in items:
        product = await db.products.find_one({"id": item["product_id"]}, {"_id": 0})
        if product:
            enriched.append({**item, "product": product})
    return enriched


@api_router.post("/wishlist")
async def add_to_wishlist(payload: WishlistAddIn, user: dict = Depends(get_current_user)):
    product = await db.products.find_one({"id": payload.product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    existing = await db.wishlist.find_one({
        "user_id": user["id"], "product_id": payload.product_id,
    })
    if existing:
        return {"ok": True, "id": existing["id"]}
    item = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "product_id": payload.product_id,
        "added_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.wishlist.insert_one(item)
    return {"ok": True, "id": item["id"]}


@api_router.delete("/wishlist/{product_id}")
async def delete_wishlist(product_id: str, user: dict = Depends(get_current_user)):
    result = await db.wishlist.delete_one({"product_id": product_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Wishlist item not found")
    return {"ok": True}


# ---------------------------------------------------------------------------
# Routes — Newsletter
# ---------------------------------------------------------------------------
@api_router.post("/newsletter")
async def subscribe_newsletter(payload: NewsletterIn):
    email = payload.email.lower()
    existing = await db.newsletter.find_one({"email": email})
    if existing:
        return {"ok": True, "already_subscribed": True}
    await db.newsletter.insert_one({
        "id": str(uuid.uuid4()),
        "email": email,
        "subscribed_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"ok": True, "already_subscribed": False}


@api_router.get("/")
async def root():
    return {"message": "ÉVORA API"}


# ---------------------------------------------------------------------------
# Seeders
# ---------------------------------------------------------------------------
SEED_PRODUCTS = [
    {
        "name": "Atelier Oversized Tee",
        "slug": "atelier-oversized-tee",
        "price": 89.0,
        "original_price": 120.0,
        "category": "Oversized Tees",
        "description": "Heavyweight cotton with relaxed silhouette. Designed in Milan, finished by hand. The Atelier tee is the foundation of effortless luxury.",
        "images": [
            "https://images.unsplash.com/photo-1642400997435-f4b7c0f68ce9",
            "https://images.unsplash.com/photo-1643387848945-da63360662f4",
        ],
        "sizes": ["S", "M", "L", "XL"],
        "colors": ["Bone", "Onyx"],
        "rating": 4.8, "reviews_count": 142, "in_stock": True,
        "is_new": True, "is_trending": True,
    },
    {
        "name": "Nocturne Hooded Sweatshirt",
        "slug": "nocturne-hoodie",
        "price": 185.0,
        "original_price": None,
        "category": "Hoodies",
        "description": "Brushed loop-back fleece with extended hood and tonal embroidery. A modern classic, refined for the season.",
        "images": [
            "https://images.unsplash.com/photo-1618924250113-e162305ac8cd",
            "https://images.unsplash.com/photo-1698180432214-158a26ddb62b",
        ],
        "sizes": ["S", "M", "L", "XL"],
        "colors": ["Onyx", "Sand"],
        "rating": 4.9, "reviews_count": 218, "in_stock": True,
        "is_new": False, "is_trending": True,
    },
    {
        "name": "Maison Tailored Bomber",
        "slug": "maison-bomber",
        "price": 420.0,
        "original_price": 520.0,
        "category": "Jackets",
        "description": "Cropped bomber in technical satin, weighted with a quilted lining. Tailored for slow movement and quiet entrances.",
        "images": [
            "https://images.unsplash.com/photo-1615545362149-85299994b09b",
            "https://images.unsplash.com/photo-1649624963958-554d32e28c55",
        ],
        "sizes": ["S", "M", "L"],
        "colors": ["Black"],
        "rating": 4.7, "reviews_count": 96, "in_stock": True,
        "is_new": True, "is_trending": True,
    },
    {
        "name": "Boulevard Cargo Pant",
        "slug": "boulevard-cargo",
        "price": 215.0,
        "original_price": None,
        "category": "Streetwear",
        "description": "Wide-leg cargo cut from washed Japanese twill. Anchored hem, deep utility pockets, generous taper.",
        "images": [
            "https://images.pexels.com/photos/25745247/pexels-photo-25745247.jpeg",
            "https://images.unsplash.com/photo-1649624964799-609681c92d1b",
        ],
        "sizes": ["28", "30", "32", "34"],
        "colors": ["Stone", "Onyx"],
        "rating": 4.6, "reviews_count": 73, "in_stock": True,
        "is_new": False, "is_trending": True,
    },
    {
        "name": "Linen Resort Shirt",
        "slug": "linen-resort-shirt",
        "price": 145.0,
        "original_price": None,
        "category": "Oversized Tees",
        "description": "Open-weave Belgian linen with mother-of-pearl buttons. Drape it, layer it, live in it.",
        "images": [
            "https://images.unsplash.com/photo-1643387848945-da63360662f4",
        ],
        "sizes": ["S", "M", "L", "XL"],
        "colors": ["Ivory"],
        "rating": 4.5, "reviews_count": 54, "in_stock": True,
        "is_new": True, "is_trending": False,
    },
    {
        "name": "Riviera Knit Polo",
        "slug": "riviera-polo",
        "price": 165.0,
        "original_price": None,
        "category": "Oversized Tees",
        "description": "Fine-gauge silk-cotton knit with ribbed placket. The polo, distilled.",
        "images": [
            "https://images.unsplash.com/photo-1698180432214-158a26ddb62b",
        ],
        "sizes": ["S", "M", "L"],
        "colors": ["Sand", "Black"],
        "rating": 4.7, "reviews_count": 81, "in_stock": True,
        "is_new": False, "is_trending": True,
    },
    {
        "name": "Studio Half-Zip Pullover",
        "slug": "studio-half-zip",
        "price": 245.0,
        "original_price": None,
        "category": "Hoodies",
        "description": "Mid-weight merino with stand collar and matte zip. Built for transitional weather and quiet rooms.",
        "images": [
            "https://images.unsplash.com/photo-1628065124175-32d9e33b898b",
        ],
        "sizes": ["S", "M", "L", "XL"],
        "colors": ["Charcoal"],
        "rating": 4.8, "reviews_count": 64, "in_stock": True,
        "is_new": True, "is_trending": False,
    },
    {
        "name": "Heritage Wool Overcoat",
        "slug": "heritage-overcoat",
        "price": 690.0,
        "original_price": 820.0,
        "category": "Jackets",
        "description": "Double-faced Italian wool, single-breasted, raglan shoulder. A coat that will outlast trends.",
        "images": [
            "https://images.unsplash.com/photo-1649624963958-554d32e28c55",
        ],
        "sizes": ["S", "M", "L"],
        "colors": ["Camel", "Onyx"],
        "rating": 4.9, "reviews_count": 112, "in_stock": True,
        "is_new": False, "is_trending": True,
    },
    {
        "name": "Field Utility Vest",
        "slug": "field-vest",
        "price": 195.0,
        "original_price": None,
        "category": "Streetwear",
        "description": "Garment-dyed canvas with shotgun pockets and adjustable side tabs. Form meeting function.",
        "images": [
            "https://images.pexels.com/photos/25745247/pexels-photo-25745247.jpeg",
        ],
        "sizes": ["S", "M", "L"],
        "colors": ["Olive", "Stone"],
        "rating": 4.4, "reviews_count": 38, "in_stock": True,
        "is_new": True, "is_trending": False,
    },
    {
        "name": "Marble Leather Tote",
        "slug": "marble-tote",
        "price": 320.0,
        "original_price": None,
        "category": "Accessories",
        "description": "Vegetable-tanned bovine leather, hand-stitched handles, suede-lined interior. Ages with intent.",
        "images": [
            "https://images.unsplash.com/photo-1628065124175-32d9e33b898b",
        ],
        "sizes": ["One Size"],
        "colors": ["Tan", "Black"],
        "rating": 4.8, "reviews_count": 91, "in_stock": True,
        "is_new": False, "is_trending": True,
    },
    {
        "name": "Cashmere Ribbed Beanie",
        "slug": "cashmere-beanie",
        "price": 95.0,
        "original_price": None,
        "category": "Accessories",
        "description": "Mongolian cashmere, three-gauge rib. Quiet warmth.",
        "images": [
            "https://images.unsplash.com/photo-1618924250113-e162305ac8cd",
        ],
        "sizes": ["One Size"],
        "colors": ["Ecru", "Charcoal"],
        "rating": 4.6, "reviews_count": 47, "in_stock": True,
        "is_new": True, "is_trending": False,
    },
    {
        "name": "Sable Crewneck Sweat",
        "slug": "sable-crewneck",
        "price": 175.0,
        "original_price": None,
        "category": "Hoodies",
        "description": "Heavy French terry with dropped shoulders. The crewneck, distilled to its essential gesture.",
        "images": [
            "https://images.unsplash.com/photo-1698180432214-158a26ddb62b",
        ],
        "sizes": ["S", "M", "L", "XL"],
        "colors": ["Sable", "Bone"],
        "rating": 4.7, "reviews_count": 132, "in_stock": True,
        "is_new": False, "is_trending": True,
    },
]


async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@evora.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "ÉVORA Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Seeded admin user")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}},
        )
        logger.info("Updated admin password")


async def seed_products():
    count = await db.products.count_documents({})
    if count > 0:
        return
    docs = []
    for p in SEED_PRODUCTS:
        docs.append({"id": str(uuid.uuid4()), **p, "created_at": datetime.now(timezone.utc).isoformat()})
    if docs:
        await db.products.insert_many(docs)
        logger.info(f"Seeded {len(docs)} products")


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.products.create_index("id", unique=True)
    await db.cart.create_index([("user_id", 1)])
    await db.wishlist.create_index([("user_id", 1), ("product_id", 1)])
    await db.newsletter.create_index("email", unique=True)
    await seed_admin()
    await seed_products()


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


# Register router LAST
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
