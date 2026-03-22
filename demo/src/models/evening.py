import datetime
from  sqlalchemy import UUID, Date, String,Integer,ForeignKey,UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .mixins.id import IDMixin      
from .mixins.timestamp import TimestampMixin
from src.models.base import Base


class Evening(IDMixin, TimestampMixin, Base):
    __tablename__ = "evening"

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"))
    date: Mapped[datetime.date] = mapped_column(Date, nullable=False, default=datetime.date.today())
    win: Mapped[str] = mapped_column(String , nullable=False)
    mistake: Mapped[str] = mapped_column(String, nullable=False)
    distraction: Mapped[String] = mapped_column(String, nullable=False)
    mood_rating: Mapped[Integer] = mapped_column(String, nullable=False)
    lesson: Mapped[str] = mapped_column(String, nullable=False)
    energy_rating: Mapped[Integer] = mapped_column(String, nullable=False)
    user = relationship("User", back_populates="evenings")
    
    __table_args__ = UniqueConstraint('user_id', 'date'),