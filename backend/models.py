from sqlalchemy import Column, String, Float, Integer, Date, DateTime, Enum, JSON, Text
from database import Base
from datetime import datetime
import uuid
import enum
from sqlalchemy.dialects.postgresql import UUID, ARRAY



def generate_uuid():
    return str(uuid.uuid4())


class ShipmentStatus(str, enum.Enum):
    PENDING = "Pending"
    IN_TRANSIT = "In Transit"
    DELIVERED = "Delivered"
    DELAYED = "Delayed"
    CANCELLED = "Cancelled"



class Shipment(Base):
    __tablename__ = "shipments"

    shipment_id = Column(String, primary_key=True, default=generate_uuid)
    order_id = Column(String, nullable=False)
    customer_id = Column(String, nullable=False)

    origin_address = Column(JSON, nullable=False)
    destination_address = Column(JSON, nullable=False)

    value = Column(Float, nullable=False)
    weight = Column(Float, nullable=False)
    volume = Column(Float, nullable=False)
    shelf_life_days = Column(Integer, nullable=False)
    delivery_date = Column(Date, nullable=False)

    shipment_status = Column(Enum(ShipmentStatus), default=ShipmentStatus.PENDING)
    shipment_type = Column(String, nullable=False)  # frozen / normal
    regulatory_flags = Column(JSON, default=list)   # e.g., ["hazmat", "cold_chain"]

    carrier_id = Column(String, nullable=True)
    vehicle_id = Column(String, nullable=True)

    priority_score = Column(Float, nullable=True)

    pickup_time = Column(DateTime, nullable=True)
    delivery_time = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    origin_lat = Column(Float, nullable=True)
    origin_lng = Column(Float, nullable=True)
    destination_lat = Column(Float, nullable=True)
    destination_lng = Column(Float, nullable=True)

class WeightConfig(Base):
    __tablename__ = "weight_configs"

    feature_name = Column(String, primary_key=True)  # e.g., "value", "weight", etc.
    weight_value = Column(Float, nullable=False, default=0.0)

class TruckStatusEnum(str, enum.Enum):
    available = "available"
    in_transit = "in_transit"
    maintenance = "maintenance"

# --- Truck Table ---
class Truck(Base):
    __tablename__ = "trucks"

    truck_id = Column(String, primary_key=True, default=generate_uuid)
    registration_number = Column(String, nullable=False, unique=True)
    current_location_lat = Column(Float, nullable=True)
    current_location_lng = Column(Float, nullable=True)
    capacity_kg = Column(Float, nullable=False)
    available_volume_cubic_m = Column(Float, nullable=True)
    available_from = Column(DateTime, nullable=True)
    truck_type = Column(String, nullable=True)  # e.g., "open", "container")
    driver_contact = Column(String, nullable=True)
    status = Column(Enum(TruckStatusEnum), default=TruckStatusEnum.available, nullable=True)

    # Stores list of shipment UUIDs assigned to this truck
    shipment_ids = Column(Text, nullable=True)  # Store as JSON string
