# CivicAI Roorkee

CivicAI Roorkee is an AI-powered civic complaint reporting platform for Roorkee. Users can report local civic issues using text and images, while authorities can view, prioritize, and update complaint statuses.

---

## Features

### User

* Signup/login with Firebase Authentication
* City and area stored during signup
* Simple complaint submission using:

  * One text input
  * Multiple image upload
* Complaints shown in:

  * My Complaints
  * My Area
  * Roorkee-wide feed
* Expandable complaint cards with full details and images

### Authority

* Authority dashboard
* Reported complaints grouped by severity
* Handled complaints grouped by status
* Complaint status update:

  * `reported`
  * `in_progress`
  * `resolved`
  * `rejected`

### AI

Gemini analyzes complaint text and images to generate:

* Title
* Category
* Severity
* Specific address
* AI summary
* Valid/invalid complaint status
* Confidence score
* Representative image

---

## Tech Stack

### Frontend

* React
* Vite
* Firebase Authentication
* CSS

### Backend

* FastAPI
* Firebase Admin SDK
* Firestore
* Gemini API
* ImgBB API

---

## Project Structure

```txt
CivicAI/
├── Backend/
│   ├── routes/
│   ├── auth.py
│   ├── firebase_service.py
│   ├── gemini_service.py
│   ├── image_service.py
│   └── main.py
│
├── frontend/
│   ├── src/
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Firestore Collections

### users

```json
{
  "uid": "...",
  "name": "...",
  "email": "...",
  "role": "user",
  "city": "Roorkee",
  "area": "Civil Lines",
  "createdAt": "..."
}
```

### complaints

```json
{
  "userId": "...",
  "userName": "...",
  "userEmail": "...",
  "city": "Roorkee",
  "area": "Civil Lines",
  "complaintText": "...",
  "title": "...",
  "specificAddress": "...",
  "imageUrls": ["..."],
  "iconImageUrl": "...",
  "isValidComplaint": true,
  "rejectionReason": "",
  "category": "road_damage",
  "severity": "high",
  "aiSummary": "...",
  "aiConfidence": 0.91,
  "status": "reported",
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

## API Routes

### Auth

```txt
POST /auth/create-profile
GET  /auth/me
```

### Complaints

```txt
POST /complaints/
GET  /complaints/my
GET  /complaints/area
GET  /complaints/city
```

### Authority

```txt
GET   /authority/complaints
GET   /authority/dashboard
PATCH /authority/complaints/{complaint_id}/status
```

---

## Environment Variables

### Backend

Create `Backend/.env`:

```env
FIREBASE_CREDENTIALS=Backend/firebase_key.json
GEMINI_API_KEY=your_gemini_api_key
IMGBB_API_KEY=your_imgbb_api_key
```

### Frontend

Create `frontend/.env`:

```env
VITE_BACKEND_URL=http://127.0.0.1:8000
```

---

## Local Setup

### Backend

```bash
python -m venv venv
venv\Scripts\activate
pip install fastapi uvicorn python-dotenv firebase-admin google-genai python-multipart requests
uvicorn Backend.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Usage

1. User signs up with name, city, and area.
2. User submits a complaint with text and images.
3. Gemini analyzes and structures the complaint.
4. Complaint is stored in Firestore.
5. Authority views reported complaints by severity.
6. Authority updates complaint status.
7. User can track complaint progress.

---

## Current Limitations

* Supports only Roorkee for now
* Authority role is assigned manually in Firestore
* Images are stored using ImgBB

---

## Future Improvements

* Google Maps integration
* Community verification
* Notifications
* Multi-city support
* Analytics dashboard
* Search and filters
