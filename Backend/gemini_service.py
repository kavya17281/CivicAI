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
    complaint_text: str,
    city: str,
    area: str
):
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="Gemini API key not configured"
        )

    prompt = f"""
You are an AI assistant for CivicAI Roorkee, a civic issue reporting platform.

The user belongs to:
City: {city}
Registered Area: {area}

The user complaint text is:
{complaint_text}

The user also uploaded one or more images.

Analyze the text and all images. Extract structured information for the civic authority.

Return ONLY valid JSON in this exact format:

{{
  "is_valid_complaint": true,
  "rejection_reason": "",
  "title": "short generated complaint title",
  "category": "road_damage",
  "severity": "medium",
  "summary": "short AI summary of the civic issue",
  "specific_address": "specific landmark or address extracted from text",
  "confidence": 0.85,
  "icon_image_index": 0
}}

Allowed categories:
- road_damage
- water_leakage
- streetlight_issue
- waste_management
- public_safety
- drainage_issue
- other

Allowed severity values:
- low
- medium
- high
- critical

Rules:
- is_valid_complaint must be true only if the complaint is about a real civic/public issue.
- Mark is_valid_complaint false if the complaint is spam, random, joke, personal issue, irrelevant image, fictional content, or not related to civic infrastructure/public services.
- If invalid, set category as "other", severity as "low", title as "Invalid complaint", and explain rejection_reason.
- The complaint belongs to the registered area: {area}. If the user mentions another area, still extract it only in specific_address if relevant, but do not change the official area.
- specific_address should be extracted from the text. If no clear address or landmark is mentioned, return "Not specified".
- confidence must be a number between 0 and 1.
- icon_image_index must be the index of the best image to represent the complaint.
- Image indexing starts from 0.
- If images are irrelevant or unclear, use icon_image_index as 0.
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
        text = text.replace("```json", "").replace("```", "").strip()

        return json.loads(text)

    except Exception as e:
        print("Gemini analysis error:", repr(e))
        raise HTTPException(
            status_code=500,
            detail="Gemini analysis failed"
        )