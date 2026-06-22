import os
import base64
import requests
from fastapi import UploadFile, HTTPException
from dotenv import load_dotenv

load_dotenv()

IMGBB_API_KEY = os.getenv("IMGBB_API_KEY")


async def upload_image_to_imgbb(image: UploadFile) -> str:
    if not IMGBB_API_KEY:
        raise HTTPException(status_code=500, detail="ImgBB API key not configured")

    image_bytes = await image.read()
    encoded_image = base64.b64encode(image_bytes).decode("utf-8")

    response = requests.post(
        "https://api.imgbb.com/1/upload",
        params={"key": IMGBB_API_KEY},
        data={"image": encoded_image},
        timeout=30
    )

    result = response.json()

    if response.status_code != 200 or not result.get("success"):
        raise HTTPException(status_code=500, detail="Image upload failed")

    return result["data"]["url"]