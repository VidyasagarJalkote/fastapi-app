from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

app = FastAPI(title="Simple FastAPI App", version="2.0.0")


class ItemIn(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: str | None = Field(default=None, max_length=500)
    price: float = Field(ge=0)


class ItemOut(ItemIn):
    id: int


# In-memory store (resets on restart; swap for a database in production)
items: dict[int, ItemOut] = {}
next_id = 1


@app.get("/health")
@app.get("/ping")
def health():
    return {"status": "ok"}


@app.get("/api/items", response_model=list[ItemOut])
def list_items():
    return list(items.values())


@app.post("/api/items", response_model=ItemOut, status_code=201)
def create_item(item: ItemIn):
    global next_id
    created = ItemOut(id=next_id, **item.model_dump())
    items[next_id] = created
    next_id += 1
    return created


@app.get("/api/items/{item_id}", response_model=ItemOut)
def get_item(item_id: int):
    if item_id not in items:
        raise HTTPException(status_code=404, detail="Item not found")
    return items[item_id]


@app.put("/api/items/{item_id}", response_model=ItemOut)
def update_item(item_id: int, item: ItemIn):
    if item_id not in items:
        raise HTTPException(status_code=404, detail="Item not found")
    items[item_id] = ItemOut(id=item_id, **item.model_dump())
    return items[item_id]


@app.delete("/api/items/{item_id}", status_code=204)
def delete_item(item_id: int):
    if item_id not in items:
        raise HTTPException(status_code=404, detail="Item not found")
    del items[item_id]


# Serve the built React app (run `npm run build` in /frontend to create it)
DIST = Path(__file__).resolve().parent.parent / "frontend" / "dist"
if DIST.exists():
    app.mount("/", StaticFiles(directory=DIST, html=True), name="frontend")
else:

    @app.get("/")
    def root():
        return {"message": "API is running. Build the frontend (see README) to see the UI."}
