from sqlalchemy import String, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from . import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class Association(db.Model):
    __tablename__ = 'associations'
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)  # Increased from 50 to 200
    cif: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(String(2000), nullable=False)
    image_url: Mapped[str] = mapped_column(String(20000), nullable=True)
    website_url: Mapped[str] = mapped_column(String(200), nullable=True)
    # New social media fields
    facebook_url: Mapped[str] = mapped_column(String(200), nullable=True)
    instagram_url: Mapped[str] = mapped_column(String(200), nullable=True)
    twitter_url: Mapped[str] = mapped_column(String(200), nullable=True)
    # Keep existing social_media_url for backward compatibility
    social_media_url: Mapped[str] = mapped_column(String(200), nullable=True)
    contact_phone: Mapped[str] = mapped_column(String(20), nullable=True)  # Increased from 15 to 20
    contact_email: Mapped[str] = mapped_column(String(120), nullable=False, unique=False)  # Explicitly set unique=False
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False)
    user = relationship("User", back_populates="association")
    events = relationship("Event", back_populates="association", cascade="all, delete-orphan")
    ratings = relationship("Rating", back_populates="association")
    
    # Recovery fields
    reset_token: Mapped[str] = mapped_column(String(256), unique=True, nullable=True, default=None)
    reset_token_expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=True, default=None)

    def __init__(self, name, cif, description, contact_email, user_id, 
                 image_url=None, website_url=None, social_media_url=None, 
                 contact_phone=None, facebook_url=None, instagram_url=None, 
                 twitter_url=None):
        self.name = name
        self.cif = cif
        self.description = description
        self.contact_email = contact_email
        self.user_id = user_id
        self.image_url = image_url
        self.website_url = website_url
        self.social_media_url = social_media_url
        self.contact_phone = contact_phone
        self.facebook_url = facebook_url
        self.instagram_url = instagram_url
        self.twitter_url = twitter_url

    def serialize(self):
        try:
            return {
                "id": self.id,
                "name": self.name,
                "cif": self.cif,
                "description": self.description,
                "image_url": self.image_url,
                "website_url": self.website_url,
                "social_media_url": self.social_media_url,
                "facebook_url": self.facebook_url,
                "instagram_url": self.instagram_url,
                "twitter_url": self.twitter_url,
                "contact_phone": self.contact_phone,
                "contact_email": self.contact_email,
                "user_id": self.user_id
            }
        except Exception as e:
            # Fallback serialization in case of errors
            return {
                "id": getattr(self, 'id', None),
                "name": getattr(self, 'name', ''),
                "cif": getattr(self, 'cif', ''),
                "description": getattr(self, 'description', ''),
                "image_url": getattr(self, 'image_url', None),
                "website_url": getattr(self, 'website_url', None),
                "social_media_url": getattr(self, 'social_media_url', None),
                "facebook_url": getattr(self, 'facebook_url', None),
                "instagram_url": getattr(self, 'instagram_url', None),
                "twitter_url": getattr(self, 'twitter_url', None),
                "contact_phone": getattr(self, 'contact_phone', None),
                "contact_email": getattr(self, 'contact_email', ''),
                "user_id": getattr(self, 'user_id', None)
            } 
    
    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)
