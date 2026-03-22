from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
	DATABASE_URL: str
	
	JWT_SECRET_KEY: str
	ACCESS_TOKEN_EXPIRE_MINUTES: int
	REFRESH_TOKEN_EXPIRE_DAYS: int
	
	UPLOAD_DIR: str
		
	model_config = SettingsConfigDict(
		env_file=".env",
		env_file_encoding="utf-8",
		case_sensitive=True
	)

settings = Settings()
