from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from Backend.firebase_service import db

app = FastAPI(title="CivicAI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "CivicAI backend is running"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/test-firestore")
def test_firestore():
    doc_ref = db.collection("test").document("first_doc")
    doc_ref.set({
        "message": "Firestore connected successfully"
    })

    return {"message": "Data written to Firestore"}


from fastapi import FastAPI, UploadFile, File
from Backend.image_service import upload_image_to_imgbb

@app.post("/test-image-upload")
async def test_image_upload(image: UploadFile = File(...)):
    image_url = await upload_image_to_imgbb(image)
    return {"imageUrl": image_url}
