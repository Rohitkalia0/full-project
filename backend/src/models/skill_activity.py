import uuid
from datetime import date

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models.base import Base
from src.models.mixins.id import IDMixin
from src.models.mixins.timestamp import TimestampMixin


class SkillActivity(IDMixin, TimestampMixin, Base):
	__tablename__ = "skill_activities"

	skill_id: Mapped[uuid.UUID] = mapped_column(
		ForeignKey("skills.id"),
		index=True
	)

	entry_date: Mapped[date] = mapped_column(
		default= lambda: date.today()
	)

	name: Mapped[str] = mapped_column()

	is_priority: Mapped[bool] = mapped_column(
		default=False
	)

	is_habit_to_protect: Mapped[bool] = mapped_column(
		default=False
	)

	is_completed: Mapped[bool] = mapped_column(
		default=False
	)

	minutes_practised: Mapped[int] = mapped_column(
		default=0
	)

	skill: Mapped["Skill"] = relationship(
	    back_populates="activities"
	)