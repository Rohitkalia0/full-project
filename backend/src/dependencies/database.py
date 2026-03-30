from src.database.database import sessionLocal

def get_db():
	db = sessionLocal()
	try:
		yield db
		db.commit()
	except Exception:
		db.rollback()
		raise
	finally:
		db.close()
