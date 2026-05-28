"""Run this once to create the first admin user.
Usage: python seed_admin.py
"""
import os
from dotenv import load_dotenv
load_dotenv()

from database import SessionLocal, engine, Base
import models
from auth import hash_password

Base.metadata.create_all(bind=engine)

db = SessionLocal()

email = input("Admin email: ").strip()
name = input("Admin name: ").strip()
password = input("Admin password: ").strip()

existing = db.query(models.User).filter(models.User.email == email).first()
if existing:
    existing.is_admin = True
    db.commit()
    print(f"✓ User {email} promoted to admin.")
else:
    user = models.User(name=name, email=email, hashed_password=hash_password(password), is_admin=True)
    db.add(user)
    db.commit()
    print(f"✓ Admin user {email} created.")

db.close()
