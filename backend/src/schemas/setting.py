from datetime import time
from typing import Union
 
from pydantic import ConfigDict, model_validator
 
from src.schemas.base import BaseSchema
 
 
def check_time_end_from_start(
	morning_start_time: time,
	morning_end_time: time,
	evening_start_time: time, 
	evening_end_time: time
) -> None:
	if morning_end_time <= morning_start_time:
		raise ValueError("morning_end_time must be after morning_start_time")
	if evening_end_time <= evening_start_time:
		raise ValueError("evening_end_time must be after evening_start_time")
	if morning_end_time > evening_start_time:
		raise ValueError("morning and evening time ranges must not overlap")
 
 
class SettingResponse(BaseSchema):
	model_config = ConfigDict(from_attributes=True)
 
	morning_start_time: time
	morning_end_time: time
	evening_start_time: time
	evening_end_time: time
	is_morning_reminder_enabled: bool
	is_evening_reminder_enabled: bool
 
 
class SettingCreateRequest(BaseSchema):
	morning_start_time: time
	morning_end_time: time
	evening_start_time: time
	evening_end_time: time
	is_morning_reminder_enabled: bool = True
	is_evening_reminder_enabled: bool = True
	@model_validator(mode="after")
	def validate_times(self):
		check_time_end_from_start(
			self.morning_start_time,
			self.morning_end_time,
			self.evening_start_time,
			self.evening_end_time
		)
		return self
 
 
class SettingPartialUpdateRequest(BaseSchema):
	morning_start_time: Union[time, None] = None
	morning_end_time: Union[time, None] = None
	evening_start_time: Union[time, None] = None
	evening_end_time: Union[time, None] = None
	is_morning_reminder_enabled: Union[bool, None] = None
	is_evening_reminder_enabled: Union[bool, None] = None
	@model_validator(mode="after")
	def validate_times(self):
		providied_times_count = (self.morning_start_time is not None) + (self.morning_end_time is not None)+ (self.evening_start_time is not None) + (self.evening_end_time is not None)
		if 0 < providied_times_count < 4:
			raise ValueError("both morning and evening start and end times must be present")
		if providied_times_count == 4:
			check_time_end_from_start(
				self.morning_start_time,
				self.morning_end_time,
				self.evening_start_time,
				self.evening_end_time
			)
 
		return self