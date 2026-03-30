import bcrypt

def hash_password(password: str) -> str:
    #here Converting  string into bytes
    password_bytes = password.encode("utf-8")
    
    #Generating salt and hash
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    
    #Storing as string in DB
    return hashed.decode("utf-8")


def verify_password(plain_password: str, stored_hash: str) -> bool:
    #Converting both into bytes
    password_bytes = plain_password.encode("utf-8")
    stored_hash_bytes = stored_hash.encode("utf-8")
    
    #Comparing
    return bcrypt.checkpw(password_bytes, stored_hash_bytes)
