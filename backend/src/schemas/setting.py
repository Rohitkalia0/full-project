from datetime import time
from typing import Union

from pydantic import ConfigDict, model_validator

from src.schemas.base import BaseSchema


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
	is_morning_reminder_enabled: bool
	is_evening_reminder_enabled: bool

	@model_validator(mode="after")
	def end_from_start(self):
		if self.morning_end_time <= self.morning_start_time or self.evening_end_time <= self.evening_start_time:
			raise ValueError("morning_end_time must be after morning_start_time and evening_end_time must be after evening_start_time")
		return self


class SettingPartialUpdateRequest(BaseSchema):
	morning_start_time: Union[time, None] = None
	morning_end_time: Union[time, None] = None
	evening_start_time: Union[time, None] = None
	evening_end_time: Union[time, None] = None
	is_morning_reminder_enabled: Union[bool, None] = None
	is_evening_reminder_enabled: Union[bool, None] = None
	
	@model_validator(mode="after")
	def check_start_end_presence(self):
		morning_start_time_present = bool(self.morning_start_time)
		morning_end_time_present = bool(self.morning_end_time)
		evening_start_time_present = bool(self.evening_start_time)
		evening_end_time_present = bool(self.evening_end_time)
		
		if (morning_start_time_present ^ morning_end_time_present):
			raise ValueError("both morning_start_time and morning_end_time must be present")
		
		if (evening_start_time_present ^ evening_end_time_present):
			raise ValueError("both evening_start_time and evening_end_time must be present")
		
		return self

    
	@model_validator(mode="after")
	def end_from_start(self):
		if self.morning_start_time and self.morning_end_time:
			if self.morning_end_time <= self.morning_start_time:
				raise ValueError("morning_end_time must be after morning_start_time")
			
		if self.evening_start_time and self.evening_end_time:
			if self.evening_end_time <= self.evening_start_time:
				raise ValueError("evening_end_time must be after evening_start_time")
		
		return self
