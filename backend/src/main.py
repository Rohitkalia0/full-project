from fastapi import FastAPI
import cloudinary

from src.core.config import settings
from src.database.database import engine
from src.exceptions import register_exception_handlers
from src.models.base import Base
from src.routes.auth import router as auth_router
from src.routes.evening import router as evening_router
from src.routes.morning import router as morning_router
from src.routes.setting import router as setting_router
from src.routes.skill import router as skill_router
from src.routes.user import router as user_router
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()


@app.on_event("startup")
def startup():
	Base.metadata.create_all(
		bind=engine
	)
	cloudinary.config(
		cloud_name=settings.CLOUDINARY_CLOUD_NAME,
		api_key=settings.CLOUDINARY_API_KEY,
		api_secret=settings.CLOUDINARY_API_SECRET,
		secure=True
	)


register_exception_handlers(app)

@app.get("/")
def health_check():
    return {
    	"status": "backend running"
    }

app.include_router(auth_router, prefix="/api/v1")
app.include_router(skill_router, prefix="/api/v1")
app.include_router(setting_router, prefix="/api/v1")
app.include_router(user_router, prefix="/api/v1")
app.include_router(evening_router, prefix="/api/v1")
app.include_router(morning_router, prefix="/api/v1")
app.include_router(user_router, prefix="/api/v1")



app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]     
)