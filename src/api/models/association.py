from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from . import db

class Association(db.Model):
    __tablename__ = 'associations'
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    cif: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(String(1000), nullable=False)
    image_url: Mapped[str] = mapped_column(String(500), nullable=True)
    website_url: Mapped[str] = mapped_column(String(500), nullable=True)
    social_media_url: Mapped[str] = mapped_column(String(500), nullable=True)
    contact_phone: Mapped[str] = mapped_column(String(20), nullable=True)
    contact_email: Mapped[str] = mapped_column(String(120), nullable=False)
    
    # Foreign key to User
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False)
    
    # Relationship with User (one-to-one)
    user = relationship("User", back_populates="association")

    def __init__(self, name, cif, description, contact_email, user_id, 
                 image_url=None, website_url=None, social_media_url=None, 
                 contact_phone=None):
        self.name = name
        self.cif = cif
        self.description = description
        self.contact_email = contact_email
        self.user_id = user_id
        self.image_url = image_url
        self.website_url = website_url
        self.social_media_url = social_media_url
        self.contact_phone = contact_phone

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "cif": self.cif,
            "description": self.description,
            "image_url": self.image_url,
            "website_url": self.website_url,
            "social_media_url": self.social_media_url,
            "contact_phone": self.contact_phone,
            "contact_email": self.contact_email,
            "user_id": self.user_id
        } 