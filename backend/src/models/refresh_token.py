import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import Base
from src.models.mixins.id import IDMixin
from src.models.mixins.timestamp import TimestampMixin


class RefreshToken(IDMixin, TimestampMixin, Base):
	__tablename__ = "refresh_tokens"

	user_id: Mapped[uuid.UUID] = mapped_column(
		ForeignKey("users.id"),
		index=True
	)

	token: Mapped[str] = mapped_column(
		index=True
	)

	issued_at: Mapped[datetime] = mapped_column(
		DateTime(timezone=True)
	)

	expires_at: Mapped[datetime] = mapped_column(
		DateTime(timezone=True)
	)

	user: Mapped["User"] = relationship(
		back_populates="refresh_tokens"
	)
