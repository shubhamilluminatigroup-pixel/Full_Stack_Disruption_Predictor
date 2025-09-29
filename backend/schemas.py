
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import date, datetime
from uuid import UUID


class Truckcreate(BaseModel):

    registration_number: str = Field(..., example="RJ14AB1234")
    current_location_lat: Optional[float] = None
    current_location_lng: Optional[float] = None
    capacity_kg: float = Field(..., example=10000)
    available_volume_cubic_m: Optional[float] = None
    available_from: Optional[datetime] = None
    truck_type: Optional[str] = None
    driver_contact: Optional[str] = None
    status: Optional[str] = None
    
    # ✅ New field to store shipment IDs assigned to this truck

from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import date, datetime
from uuid import UUID
from typing import List, Union



class Address(BaseModel):
    street: str
    city: str
    state: str
    pincode: str
    country: str


class ShipmentCreate(BaseModel):
    order_id: str
    customer_id: str
    origin_address: Address
    destination_address: Address

    value: float
    weight: float
    volume: float
    shelf_life_days: int
    delivery_date: date

    shipment_type: Literal["frozen", "normal"]
    regulatory_flags: List[str] = Field(default_factory=list)

    carrier_id: Optional[str] = None
    vehicle_id: Optional[str] = None

    pickup_time: Optional[datetime] = None
    delivery_time: Optional[datetime] = None

    priority_score: Optional[float] = None
    origin_lat: Optional[float] = None
    origin_lng: Optional[float] = None
    destination_lat: Optional[float] = None
    destination_lng: Optional[float] = None



class Shipment(BaseModel):
    shipment_id: str
    shipment_status: str
    created_at: datetime
    updated_at: datetime
    priority_score: Optional[float] = None
    shelf_life_days: int
    origin_address: Address
    destination_address: Address
    volume: float
    weight: float
    value: float
    origin_lat: Optional[float] = None
    origin_lng: Optional[float] = None
    destination_lat: Optional[float] = None
    destination_lng: Optional[float] = None
    regulatory_flags: Union[List[str], str, None] = Field(default_factory=list)
    vehicle_id: Optional[str] = None
    class Config:
        orm_mode = True

class FixedWeightConfig(BaseModel):
    value: float = Field(..., ge=0, le=1)
    weight: float = Field(..., ge=0, le=1)
    volume: float = Field(..., ge=0, le=1)
    shelf_life_days: float = Field(..., ge=0, le=1)
    days_to_delivery: float = Field(..., ge=0, le=1)

    class Config:
        schema_extra = {
            "example": {
                "value": 0.25,
                "weight": 0.25,
                "volume": 0.25,
                "shelf_life_days": 0.25,
                "days_to_delivery": 0.25
            }
        }

class WeightConfigItem(BaseModel):
    feature_name: str
    weight_value: float

    class Config:
        orm_mode = True

class ShipmentNo(BaseModel):
    shipment_id: str
    origin_lat: Optional[float] = None
    origin_lng: Optional[float] = None
    destination_lat: Optional[float] = None
    destination_lng: Optional[float] = None

    class Config:
        from_attributes = True  # For Pydantic v2

class Truckshow(BaseModel):
    
    registration_number: str = Field(..., example="RJ14AB1234")
    current_location_lat: Optional[float] = None
    current_location_lng: Optional[float] = None
    capacity_kg: float = Field(..., example=10000)
    available_volume_cubic_m: Optional[float] = None
    available_from: Optional[datetime] = None
    truck_type: Optional[str] = None
    driver_contact: Optional[str] = None
    status: Optional[str] = None
    truck_id: str
    shipment_ids: str