from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from . import db

class User(db.Model):
    __tablename__ = 'users'
    
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=True)
    lastname: Mapped[str] = mapped_column(String(100), nullable=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False, default=True)
    
    # Relationship with Association (one-to-one)
    association = relationship("Association", back_populates="user", uselist=False)
    
    # Relationship with EventVolunteer (many-to-many through EventVolunteer)
    event_volunteers = relationship("EventVolunteer", back_populates="volunteer")

    event_volunteers = relationship("EventVolunteer", back_populates="volunteer")

    event_volunteers = relationship("EventVolunteer", back_populates="volunteer")

    def __init__(self, email, password, name=None, lastname=None, phone=None):
        self.email = email
        self.password = password
        self.name = name
        self.lastname = lastname
        self.phone = phone

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
            "is_active": self.is_active
        } 