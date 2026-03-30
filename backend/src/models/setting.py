import uuid
from datetime import datetime, time
from typing import Union

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import Base
from src.models.mixins.id import IDMixin
from src.models.mixins.timestamp import TimestampMixin


class Setting(IDMixin, TimestampMixin, Base):
	__tablename__ = "settings"

	user_id: Mapped[uuid.UUID] = mapped_column(
		ForeignKey("users.id"),
		unique=True
	)

	morning_start_time: Mapped[time] = mapped_column()

	morning_end_time: Mapped[time] = mapped_column()

	is_morning_reminder_enabled: Mapped[bool] = mapped_column(
		default=False
	)

	evening_start_time: Mapped[time] = mapped_column()

	evening_end_time: Mapped[time] = mapped_column()

	is_evening_reminder_enabled: Mapped[bool] = mapped_column(
		default=False
	)

	last_password_changed_at: Mapped[Union[datetime, None]] = mapped_column()
	
	user: Mapped["User"] = relationship(
        back_populates="setting"
    )
