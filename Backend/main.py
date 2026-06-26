from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from Backend.auth import get_current_user, require_authority
from Backend.routes.auth_routes import router as auth_router
from Backend.routes.complaint_routes import router as complaint_router
from Backend.routes.authority_routes import router as authority_router

app = FastAPI(title="CivicAI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(complaint_router)
app.include_router(authority_router)


@app.get("/")
def root():
    return {"message": "CivicAI backend is running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/protected")
def protected_route(current_user: dict = Depends(get_current_user)):
    return {
        "message": "You are authenticated",
        "user": current_user
    }


@app.get("/authority-only")
def authority_only_route(current_user: dict = Depends(require_authority)):
    return {
        "message": "You are authority",
        "user": current_user
    }