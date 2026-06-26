import os
import json
from fastapi import HTTPException
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=GEMINI_API_KEY)


def analyze_complaint_with_gemini(
    images_data: list,
    title: str,
    description: str,
    city: str,
    area: str
):
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="Gemini API key not configured"
        )

    prompt = f"""
You are an AI assistant for CivicAI, a civic issue reporting platform.

A user has submitted a civic complaint with multiple images.

City: {city}
Area/Locality: {area}
Title: {title}
Description: {description}

Analyze all uploaded images and the complaint text.

Return ONLY valid JSON in this exact format:

{{
  "is_civic_issue": true,
  "category": "road_damage",
  "severity": "medium",
  "summary": "short summary of the issue",
  "confidence": 0.85,
  "icon_image_index": 0
}}

Allowed categories:
- road_damage
- water_leakage
- streetlight_issue
- waste_management
- public_safety
- other

Allowed severity values:
- low
- medium
- high
- critical

Rules:
- is_civic_issue must be true if the complaint is actually related to a civic/public issue.
- is_civic_issue must be false if the images/text are irrelevant, fake, random, personal, or not civic-related.
- category must be one of the allowed categories.
- severity must be one of the allowed severity values.
- confidence must be a number between 0 and 1.
- icon_image_index must be the index of the best image to represent the complaint.
- Image indexing starts from 0.
- If images are irrelevant, use icon_image_index as 0.
- Do not include markdown.
- Do not include explanation outside JSON.
"""

    contents = []

    for image_data in images_data:
        contents.append(
            types.Part.from_bytes(
                data=image_data["bytes"],
                mime_type=image_data["mime_type"]
            )
        )

    contents.append(prompt)

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=contents
        )

        text = response.text.strip()

        text = text.replace("```json", "")
        text = text.replace("```", "")
        text = text.strip()

        ai_result = json.loads(text)

        return ai_result

    except Exception as e:
        print("Gemini analysis error:", repr(e))
        raise HTTPException(
            status_code=500,
            detail="Gemini analysis failed"
        )