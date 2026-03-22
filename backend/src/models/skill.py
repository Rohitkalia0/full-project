import uuid
from typing import List

from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import Base
from src.models.mixins.id import IDMixin
from src.models.mixins.timestamp import TimestampMixin


class Skill(IDMixin, TimestampMixin, Base):
	__tablename__ = "skills"
	__table_args__ = (UniqueConstraint("user_id", "name"),)

	user_id: Mapped[uuid.UUID] = mapped_column(
		ForeignKey("users.id"),
		index=True
	)

	name: Mapped[str] = mapped_column(
		index=True
	)

	is_completed: Mapped[bool] = mapped_column(
		default=False
	)

	user: Mapped["User"] = relationship(
	    back_populates="skills"
	)

	activities: Mapped[List["SkillActivity"]] = relationship(
	    back_populates="skill",
	    cascade="all, delete-orphan"
	)
