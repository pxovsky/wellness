from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional

class TrainingCreateRequest(BaseModel):
    dt: str = Field(..., description="DateTime in format YYYY-MM-DD HH:MM")
    duration_min: int = Field(gt=0, le=300)
    calories: int = Field(ge=0, le=10000)
    avg_hr: int = Field(gt=0, le=220)
    max_hr: int = Field(gt=0, le=220)
    training_effect: float = Field(ge=0.0, le=5.0)
    notes: str = Field(default="", max_length=1000)
    
    @validator('max_hr')
    def validate_max_hr(cls, v, values):
        if 'avg_hr' in values and v < values['avg_hr']: raise ValueError('max_hr must be >= avg_hr')
        return v
    
    @validator('dt')
    def validate_datetime(cls, v):
        try: datetime.strptime(v, '%Y-%m-%d %H:%M')
        except ValueError: raise ValueError('DateTime format error')
        return v

class TrainingResponse(BaseModel):
    id: int
    dt: str
    duration_min: int
    calories: int
    avg_hr: int
    max_hr: int
    training_effect: float
    notes: str

class DailyLogCreateRequest(BaseModel):
    date: str
    reading: Optional[int] = Field(None, ge=0, le=999)
    kefir: Optional[int] = Field(None, ge=0, le=500)

class DailyLogResponse(BaseModel):
    date: str
    reading: Optional[int]
    kefir: Optional[int]
    streak_reading: int
    streak_kefir: int

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
