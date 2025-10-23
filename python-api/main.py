from __future__ import annotations
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Literal, Optional
import json
import os
import threading

DATA_FILE = os.path.join(os.path.dirname(__file__), "data.json")
lock = threading.Lock()

class MapPosition(BaseModel):
    x: float
    y: float

class Size(BaseModel):
    width: float
    height: float

class CarnivalEvent(BaseModel):
    id: str
    title: str
    description: str
    scheduledTime: str
    duration: int
    location: str
    participants: int
    ticketCost: str
    category: Literal["game", "performance", "food", "activity", "contest"]
    status: Literal["upcoming", "active", "completed"]
    eventType: Optional[Literal["scheduled", "constant"]] = "scheduled"
    mapPosition: Optional[MapPosition] = None

class MapBlock(BaseModel):
    id: str
    type: Literal["wall", "booth", "stage", "entrance"]
    label: str
    position: MapPosition
    size: Size

class Store(BaseModel):
    events: List[CarnivalEvent] = []
    mapBlocks: List[MapBlock] = []

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Utilities

def load_store() -> Store:
    if not os.path.exists(DATA_FILE):
        return Store()
    with lock:
        with open(DATA_FILE, "r") as f:
            data = json.load(f)
    return Store(**data)


def save_store(store: Store) -> None:
    with lock:
        with open(DATA_FILE, "w") as f:
            json.dump(store.model_dump(), f, indent=2)

# Seed if empty
if not os.path.exists(DATA_FILE):
    initial = Store(
        events=[
            CarnivalEvent(
                id="1",
                title="Face Painting Station",
                description="Get your face painted with amazing designs! Professional artists available.",
                scheduledTime="",
                duration=120,
                location="Main Tent A",
                participants=25,
                ticketCost="3",
                category="activity",
                status="upcoming",
                eventType="constant",
                mapPosition={"x": 20, "y": 30},
            )
        ],
        mapBlocks=[
            MapBlock(
                id="block-1",
                type="wall",
                label="North Wall",
                position={"x": 10, "y": 5},
                size={"width": 80, "height": 3},
            )
        ],
    )
    save_store(initial)

# Routes

@app.get("/health")
async def health():
    return {"ok": True}

@app.get("/store", response_model=Store)
async def get_store():
    return load_store()

@app.put("/store", response_model=Store)
async def replace_store(store: Store):
    save_store(store)
    return store

# Events

@app.get("/events", response_model=List[CarnivalEvent])
async def list_events():
    return load_store().events

class EventCreate(BaseModel):
    title: str
    description: str
    scheduledTime: str
    duration: int
    location: str
    participants: int
    ticketCost: str
    category: Literal["game", "performance", "food", "activity", "contest"]
    eventType: Optional[Literal["scheduled", "constant"]] = "scheduled"
    mapPosition: Optional[MapPosition] = None

@app.post("/events", response_model=CarnivalEvent)
async def create_event(payload: EventCreate):
    store = load_store()
    new_id = os.urandom(6).hex()
    event = CarnivalEvent(id=new_id, status="upcoming", **payload.model_dump())
    store.events.append(event)
    save_store(store)
    return event

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    scheduledTime: Optional[str] = None
    duration: Optional[int] = None
    location: Optional[str] = None
    participants: Optional[int] = None
    ticketCost: Optional[str] = None
    category: Optional[Literal["game", "performance", "food", "activity", "contest"]] = None
    status: Optional[Literal["upcoming", "active", "completed"]] = None
    eventType: Optional[Literal["scheduled", "constant"]] = None
    mapPosition: Optional[MapPosition] = None

@app.patch("/events/{event_id}", response_model=CarnivalEvent)
async def update_event(event_id: str, payload: EventUpdate):
    store = load_store()
    for i, e in enumerate(store.events):
        if e.id == event_id:
            data = e.model_dump()
            data.update({k: v for k, v in payload.model_dump(exclude_none=True).items()})
            store.events[i] = CarnivalEvent(**data)
            save_store(store)
            return store.events[i]
    raise HTTPException(status_code=404, detail="Event not found")

@app.delete("/events/{event_id}")
async def delete_event(event_id: str):
    store = load_store()
    new_events = [e for e in store.events if e.id != event_id]
    if len(new_events) == len(store.events):
        raise HTTPException(status_code=404, detail="Event not found")
    store.events = new_events
    save_store(store)
    return {"ok": True}

# Map Blocks

@app.get("/map-blocks", response_model=List[MapBlock])
async def list_blocks():
    return load_store().mapBlocks

class BlockCreate(BaseModel):
    type: Literal["wall", "booth", "stage", "entrance"]
    label: str
    position: MapPosition
    size: Size

@app.post("/map-blocks", response_model=MapBlock)
async def create_block(payload: BlockCreate):
    store = load_store()
    new_id = "block-" + os.urandom(6).hex()
    block = MapBlock(id=new_id, **payload.model_dump())
    store.mapBlocks.append(block)
    save_store(store)
    return block

class BlockUpdate(BaseModel):
    type: Optional[Literal["wall", "booth", "stage", "entrance"]] = None
    label: Optional[str] = None
    position: Optional[MapPosition] = None
    size: Optional[Size] = None

@app.patch("/map-blocks/{block_id}", response_model=MapBlock)
async def update_block(block_id: str, payload: BlockUpdate):
    store = load_store()
    for i, b in enumerate(store.mapBlocks):
        if b.id == block_id:
            data = b.model_dump()
            data.update({k: v for k, v in payload.model_dump(exclude_none=True).items()})
            store.mapBlocks[i] = MapBlock(**data)
            save_store(store)
            return store.mapBlocks[i]
    raise HTTPException(status_code=404, detail="Block not found")

@app.delete("/map-blocks/{block_id}")
async def delete_block(block_id: str):
    store = load_store()
    new_blocks = [b for b in store.mapBlocks if b.id != block_id]
    if len(new_blocks) == len(store.mapBlocks):
        raise HTTPException(status_code=404, detail="Block not found")
    store.mapBlocks = new_blocks
    save_store(store)
    return {"ok": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8001, reload=True)
