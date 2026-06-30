from google.cloud.firestore import SERVER_TIMESTAMP

from Backend.firebase_service import db


DEMO_USERS = [
    {
        "uid": "demo_user_001",
        "name": "Aarav Sharma",
        "email": "aarav.demo@example.com",
        "role": "user",
        "city": "Roorkee",
        "area": "Civil Lines"
    },
    {
        "uid": "demo_user_002",
        "name": "Meera Joshi",
        "email": "meera.demo@example.com",
        "role": "user",
        "city": "Roorkee",
        "area": "Main Market"
    },
    {
        "uid": "demo_user_003",
        "name": "Rohan Verma",
        "email": "rohan.demo@example.com",
        "role": "user",
        "city": "Roorkee",
        "area": "Railway Road"
    },
    {
        "uid": "demo_user_004",
        "name": "Ananya Singh",
        "email": "ananya.demo@example.com",
        "role": "user",
        "city": "Roorkee",
        "area": "IIT Roorkee Campus"
    },
    {
        "uid": "demo_user_005",
        "name": "Kabir Malhotra",
        "email": "kabir.demo@example.com",
        "role": "user",
        "city": "Roorkee",
        "area": "Dhandera"
    },
]


DEMO_IMAGE_URLS = {
    "road_damage": "https://images.unsplash.com/photo-1573561431048-0f1f3d8e0aa3?auto=format&fit=crop&w=900&q=80",
    "water_leakage": "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=900&q=80",
    "streetlight_issue": "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=80",
    "waste_management": "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&w=900&q=80",
    "public_safety": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    "drainage_issue": "https://images.unsplash.com/photo-1584467541268-b040f83be3fd?auto=format&fit=crop&w=900&q=80",
    "other": "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=900&q=80"
}


DEMO_COMPLAINTS = [
    {
        "userId": "demo_user_001",
        "userName": "Aarav Sharma",
        "userEmail": "aarav.demo@example.com",
        "city": "Roorkee",
        "area": "Civil Lines",
        "complaintText": "There is a large pothole near the Civil Lines post office. Vehicles are slowing down suddenly and it may cause an accident.",
        "title": "Large pothole near Civil Lines post office",
        "specificAddress": "Near Civil Lines post office",
        "category": "road_damage",
        "severity": "critical",
        "status": "reported",
        "aiSummary": "A large pothole has been reported near the Civil Lines post office, creating a possible accident risk for vehicles.",
        "aiConfidence": 0.93,
        "isValidComplaint": True,
        "rejectionReason": ""
    },
    {
        "userId": "demo_user_002",
        "userName": "Meera Joshi",
        "userEmail": "meera.demo@example.com",
        "city": "Roorkee",
        "area": "Main Market",
        "complaintText": "Garbage has been lying near the Main Market entrance for several days and is causing bad smell.",
        "title": "Garbage pile near Main Market entrance",
        "specificAddress": "Near Main Market entrance",
        "category": "waste_management",
        "severity": "high",
        "status": "reported",
        "aiSummary": "A garbage pile near Main Market entrance is causing hygiene and odor issues.",
        "aiConfidence": 0.89,
        "isValidComplaint": True,
        "rejectionReason": ""
    },
    {
        "userId": "demo_user_003",
        "userName": "Rohan Verma",
        "userEmail": "rohan.demo@example.com",
        "city": "Roorkee",
        "area": "Railway Road",
        "complaintText": "Streetlight near Railway Road crossing is not working and the area becomes very dark at night.",
        "title": "Non-functional streetlight near Railway Road crossing",
        "specificAddress": "Near Railway Road crossing",
        "category": "streetlight_issue",
        "severity": "high",
        "status": "reported",
        "aiSummary": "A streetlight near Railway Road crossing is not working, causing poor visibility at night.",
        "aiConfidence": 0.91,
        "isValidComplaint": True,
        "rejectionReason": ""
    },
    {
        "userId": "demo_user_004",
        "userName": "Ananya Singh",
        "userEmail": "ananya.demo@example.com",
        "city": "Roorkee",
        "area": "IIT Roorkee Campus",
        "complaintText": "Water is leaking continuously near the campus gate and the road has become slippery.",
        "title": "Water leakage near campus gate",
        "specificAddress": "Near IIT Roorkee campus gate",
        "category": "water_leakage",
        "severity": "medium",
        "status": "reported",
        "aiSummary": "Continuous water leakage near the campus gate is making the road slippery.",
        "aiConfidence": 0.87,
        "isValidComplaint": True,
        "rejectionReason": ""
    },
    {
        "userId": "demo_user_005",
        "userName": "Kabir Malhotra",
        "userEmail": "kabir.demo@example.com",
        "city": "Roorkee",
        "area": "Dhandera",
        "complaintText": "The drainage line near Dhandera main road is blocked and dirty water is overflowing.",
        "title": "Blocked drainage near Dhandera main road",
        "specificAddress": "Near Dhandera main road",
        "category": "drainage_issue",
        "severity": "critical",
        "status": "reported",
        "aiSummary": "A blocked drainage line near Dhandera main road is causing dirty water overflow.",
        "aiConfidence": 0.94,
        "isValidComplaint": True,
        "rejectionReason": ""
    },
    {
        "userId": "demo_user_001",
        "userName": "Aarav Sharma",
        "userEmail": "aarav.demo@example.com",
        "city": "Roorkee",
        "area": "Civil Lines",
        "complaintText": "The road divider near Civil Lines chowk is damaged and sharp edges are exposed.",
        "title": "Damaged road divider near Civil Lines chowk",
        "specificAddress": "Near Civil Lines chowk",
        "category": "public_safety",
        "severity": "medium",
        "status": "reported",
        "aiSummary": "A damaged divider with exposed edges may pose a safety risk near Civil Lines chowk.",
        "aiConfidence": 0.82,
        "isValidComplaint": True,
        "rejectionReason": ""
    },
    {
        "userId": "demo_user_002",
        "userName": "Meera Joshi",
        "userEmail": "meera.demo@example.com",
        "city": "Roorkee",
        "area": "Main Market",
        "complaintText": "A manhole cover is missing near the vegetable market lane.",
        "title": "Missing manhole cover near vegetable market lane",
        "specificAddress": "Near vegetable market lane",
        "category": "public_safety",
        "severity": "critical",
        "status": "in_progress",
        "aiSummary": "A missing manhole cover near the vegetable market lane poses a serious safety risk.",
        "aiConfidence": 0.95,
        "isValidComplaint": True,
        "rejectionReason": ""
    },
    {
        "userId": "demo_user_003",
        "userName": "Rohan Verma",
        "userEmail": "rohan.demo@example.com",
        "city": "Roorkee",
        "area": "Railway Road",
        "complaintText": "Garbage bins near Railway Road are overflowing and need urgent cleaning.",
        "title": "Overflowing garbage bins near Railway Road",
        "specificAddress": "Near Railway Road shops",
        "category": "waste_management",
        "severity": "medium",
        "status": "in_progress",
        "aiSummary": "Garbage bins near Railway Road are overflowing and require cleaning.",
        "aiConfidence": 0.88,
        "isValidComplaint": True,
        "rejectionReason": ""
    },
    {
        "userId": "demo_user_004",
        "userName": "Ananya Singh",
        "userEmail": "ananya.demo@example.com",
        "city": "Roorkee",
        "area": "IIT Roorkee Campus",
        "complaintText": "The streetlight near the hostel road was not working earlier but has now been repaired.",
        "title": "Streetlight repaired near hostel road",
        "specificAddress": "Near hostel road",
        "category": "streetlight_issue",
        "severity": "low",
        "status": "resolved",
        "aiSummary": "A streetlight issue near hostel road has been marked as resolved.",
        "aiConfidence": 0.79,
        "isValidComplaint": True,
        "rejectionReason": ""
    },
    {
        "userId": "demo_user_005",
        "userName": "Kabir Malhotra",
        "userEmail": "kabir.demo@example.com",
        "city": "Roorkee",
        "area": "Dhandera",
        "complaintText": "Roadside waste near Dhandera bus stop has been cleaned.",
        "title": "Waste cleared near Dhandera bus stop",
        "specificAddress": "Near Dhandera bus stop",
        "category": "waste_management",
        "severity": "low",
        "status": "resolved",
        "aiSummary": "Roadside waste near Dhandera bus stop has been marked as resolved.",
        "aiConfidence": 0.81,
        "isValidComplaint": True,
        "rejectionReason": ""
    },
    {
        "userId": "demo_user_001",
        "userName": "Aarav Sharma",
        "userEmail": "aarav.demo@example.com",
        "city": "Roorkee",
        "area": "Civil Lines",
        "complaintText": "This is just a test complaint with random content and no civic issue.",
        "title": "Invalid complaint",
        "specificAddress": "Not specified",
        "category": "other",
        "severity": "low",
        "status": "rejected",
        "aiSummary": "The complaint does not describe a valid civic issue.",
        "aiConfidence": 0.76,
        "isValidComplaint": False,
        "rejectionReason": "The submitted text does not describe a clear civic or public infrastructure issue."
    },
    {
        "userId": "demo_user_002",
        "userName": "Meera Joshi",
        "userEmail": "meera.demo@example.com",
        "city": "Roorkee",
        "area": "Main Market",
        "complaintText": "There is waterlogging near Main Market after rain and pedestrians are unable to cross easily.",
        "title": "Waterlogging near Main Market",
        "specificAddress": "Near Main Market crossing",
        "category": "drainage_issue",
        "severity": "high",
        "status": "reported",
        "aiSummary": "Waterlogging near Main Market is affecting pedestrian movement after rain.",
        "aiConfidence": 0.9,
        "isValidComplaint": True,
        "rejectionReason": ""
    }
]


def seed_users():
    print("Seeding demo users...")

    for user in DEMO_USERS:
        user_data = user.copy()
        user_data["createdAt"] = SERVER_TIMESTAMP

        db.collection("users").document(user["uid"]).set(user_data)

    print(f"Seeded {len(DEMO_USERS)} demo users.")


def seed_complaints():
    print("Seeding demo complaints...")

    for complaint in DEMO_COMPLAINTS:
        category = complaint["category"]
        image_url = DEMO_IMAGE_URLS.get(category, DEMO_IMAGE_URLS["other"])

        complaint_data = complaint.copy()
        complaint_data["imageUrls"] = [image_url]
        complaint_data["iconImageUrl"] = image_url
        complaint_data["createdAt"] = SERVER_TIMESTAMP
        complaint_data["updatedAt"] = SERVER_TIMESTAMP

        db.collection("complaints").document().set(complaint_data)

    print(f"Seeded {len(DEMO_COMPLAINTS)} demo complaints.")


def main():
    seed_users()
    seed_complaints()
    print("Demo data seeding complete.")


if __name__ == "__main__":
    main()