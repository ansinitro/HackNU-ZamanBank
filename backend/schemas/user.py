from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    iin: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    iin: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
