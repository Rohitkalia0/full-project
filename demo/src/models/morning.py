import datetime
from  sqlalchemy import UUID, Date, Integer,ForeignKey,UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .mixins.id import IDMixin      
from .mixins.timestamp import TimestampMixin
from src.models.base import Base



class Morning(IDMixin, TimestampMixin, Base):
    __tablename__ = "morning"

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"))
    date: Mapped[datetime.date] = mapped_column(Date, nullable=False, default=datetime.date.today())
    confidence_rating: Mapped[int] = mapped_column(Integer, nullable=False)
    activities: Mapped[list["MorningActivity"]] = relationship( back_populates="morning", cascade="all, delete-orphan")
    
    __table_args__ = UniqueConstraint('user_id', 'date'),

from src.models.morning_activity import MorningActivity