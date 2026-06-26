import os
import base64
import requests
from fastapi import UploadFile, HTTPException
from dotenv import load_dotenv

load_dotenv()

IMGBB_API_KEY = os.getenv("IMGBB_API_KEY")


async def upload_image_to_imgbb(image: UploadFile):
    if not IMGBB_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="ImgBB API key not configured"
        )

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
        raise HTTPException(
            status_code=500,
            detail="Image upload failed"
        )

    image_url = result["data"]["url"]

    return image_url, image_bytes


async def upload_multiple_images_to_imgbb(images: list[UploadFile]):
    image_urls = []
    images_data = []

    if not images:
        raise HTTPException(
            status_code=400,
            detail="At least one image is required"
        )

    for image in images:
        if not image.content_type or not image.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400,
                detail="All uploaded files must be images"
            )

        image_url, image_bytes = await upload_image_to_imgbb(image)

        image_urls.append(image_url)

        images_data.append({
            "bytes": image_bytes,
            "mime_type": image.content_type,
            "url": image_url
        })

    return image_urls, images_data