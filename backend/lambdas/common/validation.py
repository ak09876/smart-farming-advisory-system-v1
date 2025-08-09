from pydantic import BaseModel, Field, ValidationError
from typing import Optional, Tuple, Dict, Any

class FarmCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    ownerPhone: str = Field(min_length=8, max_length=20)
    location: Optional[Dict[str, float]] = None  # { "lat": 18.52, "lon": 73.86 }
    areaAcres: Optional[float] = Field(default=None, ge=0)

class AdvisoryRequest(BaseModel):
    farmId: str = Field(min_length=1)
    crop: str = Field(min_length=1)
    season: Optional[str] = None
    soilType: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None

def validate(model, data: Dict[str, Any]) -> Tuple[bool, Any]:
    try:
        return True, model.model_validate(data)
    except ValidationError as e:
        return False, e.errors()
