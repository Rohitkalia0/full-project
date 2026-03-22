
from  sqlalchemy import UUID, String,ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .mixins.id import IDMixin      
from .mixins.timestamp import TimestampMixin
from src.models.base import Base
from src.models.morning import Morning


class MorningActivity(IDMixin, TimestampMixin, Base):
    __tablename__ = "morning_activity"

    checkin_id: Mapped[UUID] = mapped_column(ForeignKey("morning.id"), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    is_priority: Mapped[bool] = mapped_column(nullable=False, default=False)
    is_habit: Mapped[bool] = mapped_column(nullable=False, default=False)
    is_completed: Mapped[bool] = mapped_column(nullable=False, default=False)
    morning: Mapped["Morning"] = relationship("Morning", back_populates="activities")