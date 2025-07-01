from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from . import db

class Association(db.Model):
    __tablename__ = 'associations'
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    cif: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(String(2000), nullable=False)
    image_url: Mapped[str] = mapped_column(String(20000), nullable=True)
    website_url: Mapped[str] = mapped_column(String(200), nullable=True)
    social_media_url: Mapped[str] = mapped_column(String(200), nullable=True)
    contact_phone: Mapped[str] = mapped_column(String(15), nullable=True)
    contact_email: Mapped[str] = mapped_column(String(50), nullable=False)
    
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False)
    
    user = relationship("User", back_populates="association")
    events = relationship("Event", back_populates="association", cascade="all, delete-orphan")

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