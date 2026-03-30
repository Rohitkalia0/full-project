from datetime import datetime
from typing import List, Union

from sqlalchemy import DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import Base
from src.models.mixins.id import IDMixin
from src.models.mixins.timestamp import TimestampMixin
from src.models.evening import Evening

class User(IDMixin, TimestampMixin, Base):
    __tablename__ = "users"

    first_name: Mapped[Union[str, None]] = mapped_column()

    last_name: Mapped[Union[str, None]] = mapped_column()

    email: Mapped[str] = mapped_column(
    	unique=True,
    	index=True
    )

    password_hash: Mapped[str] = mapped_column()

    profile_pic_url: Mapped[Union[str, None]] = mapped_column()

    is_verified: Mapped[bool] = mapped_column(
    	default=False
    )

    deleted_at: Mapped[Union[datetime, None]] = mapped_column(
    	DateTime(timezone=True)
    )

    refresh_tokens: Mapped[List["RefreshToken"]] = relationship(
   		back_populates="user",
    	cascade="all, delete-orphan"
    )
    
    skills: Mapped[List["Skill"]] = relationship(
   		back_populates="user",
     	cascade="all, delete-orphan"
    )
    
    setting: Mapped["Setting"] = relationship(
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )
    evenings: Mapped[List["Evening"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan"
    )   
