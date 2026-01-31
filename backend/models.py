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
    reading_minutes: Optional[int] = Field(None, ge=0, le=1440)
    water_glasses: Optional[int] = Field(None, ge=0, le=50)
    kefir_glasses: Optional[int] = Field(None, ge=0, le=50)
    no_phone_after_21: Optional[int] = Field(None, ge=0, le=1)
    discipline_score: Optional[int] = Field(None, ge=1, le=10)
    mood_score: Optional[int] = Field(None, ge=1, le=10)
    # Nowe pola
    vibe_coding_minutes: Optional[int] = Field(None, ge=0, le=1440) # Max 24h
    household_chores: Optional[int] = Field(None, ge=0, le=50)      # Max 50 zadań
    vitamins: Optional[int] = Field(None, ge=0, le=1)               # 0 lub 1


class DailyLogResponse(BaseModel):
    date: str
    reading_minutes: Optional[int]
    water_glasses: Optional[int]
    kefir_glasses: Optional[int]
    no_phone_after_21: Optional[int]
    discipline_score: Optional[int]
    mood_score: Optional[int]
    streak_reading: int
    streak_kefir: int
    streak_water: int
    streak_no_phone: int
    # Nowe pola
    vibe_coding_minutes: Optional[int]
    household_chores: Optional[int]
    vitamins: Optional[int]


class TaskCreateRequest(BaseModel):
    title: str = Field(..., min_length=1)
    description: Optional[str] = ""
    priority: int = Field(1, ge=1, le=3) # 1=Low, 2=Medium, 3=High
    due_date: Optional[str] = None
    reminder_date: Optional[str] = None
    tags: Optional[str] = ""
    is_pinned: Optional[int] = Field(0, ge=0, le=1)

class TaskUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[int] = Field(None, ge=1, le=3)
    due_date: Optional[str] = None
    reminder_date: Optional[str] = None
    tags: Optional[str] = None
    is_completed: Optional[int] = Field(None, ge=0, le=1)
    is_pinned: Optional[int] = Field(None, ge=0, le=1)

class TaskResponse(BaseModel):
    id: int
    title: str
    description: str
    priority: int
    due_date: Optional[str]
    reminder_date: Optional[str]
    tags: str
    is_completed: int
    is_pinned: int
    created_at: str

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
