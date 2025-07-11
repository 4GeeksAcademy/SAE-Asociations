from sqlalchemy import String, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from . import db

class User(db.Model):
    __tablename__ = 'users'
    
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=True)
    lastname: Mapped[str] = mapped_column(String(100), nullable=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=True)
    profile_image: Mapped[str] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False, default=True)
    # Relationship with Association (one-to-one)
    association = relationship("Association", back_populates="user", uselist=False)
    # Relationship with EventVolunteer (many-to-many through EventVolunteer)
    event_volunteers = relationship("EventVolunteer", back_populates="volunteer")
<<<<<<< HEAD
    
    # Relationship with Rating (one-to-many)
    ratings = relationship("Rating", back_populates="user")
    
    # Recovery fields
    reset_token: Mapped[str] = mapped_column(String(256), unique=True, nullable=True, default=None)
    reset_token_expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=True, default=None)
=======
    # Recovery
    reset_token: Mapped[str] = mapped_column(String(256), unique=True, nullable=True, default=None)
    reset_token_expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=True, default=None)

>>>>>>> origin/develop

    def __init__(self, email, password, name=None, lastname=None, phone=None, profile_image=None):
        self.email = email
        self.password = password
        self.name = name
        self.lastname = lastname
        self.phone = phone
        self.profile_image = profile_image

    def __repr__(self):
        """Representación más descriptiva para Flask-Admin dropdowns"""
        if self.name and self.lastname:
            return f"{self.name} {self.lastname} ({self.email})"
        elif self.name:
            return f"{self.name} ({self.email})"
        else:
            return f"{self.email}"

    def __str__(self):
        """String representation para mostrar en dropdowns"""
        return self.__repr__()

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "lastname": self.lastname,
            "phone": self.phone,
            "profile_image": self.profile_image,
            "is_active": self.is_active
        }
    
    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
<<<<<<< HEAD
        return check_password_hash(self.password, password) 
=======
        return check_password_hash(self.password, password)
>>>>>>> origin/develop
