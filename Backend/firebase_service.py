import os
import json
import firebase_admin
from firebase_admin import credentials, firestore, auth
from dotenv import load_dotenv

load_dotenv()

firebase_key_path = os.getenv("FIREBASE_CREDENTIALS")
firebase_credentials_json = os.getenv("FIREBASE_CREDENTIALS_JSON")

if not firebase_admin._apps:
    if firebase_credentials_json:
        firebase_credentials_dict = json.loads(firebase_credentials_json)
        cred = credentials.Certificate(firebase_credentials_dict)
        firebase_admin.initialize_app(cred)

    elif firebase_key_path:
        cred = credentials.Certificate(firebase_key_path)
        firebase_admin.initialize_app(cred)

    else:
        raise RuntimeError("Firebase credentials not configured")

db = firestore.client()
firebase_auth = auth