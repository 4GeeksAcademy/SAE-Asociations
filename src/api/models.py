from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column

db = SQLAlchemy()

class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False)


    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            # do not serialize the password, its a security breach
        }
    
class Event(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    created_user_id: Mapped[int] = mapped_column(ForeignKey("association.id"))
    volunteers_id: Mapped[int] = mapped_column(ForeignKey("user.id"))

   def serializa(self):
    return {
        "id": self.id,
            "title": self.title,
            "description": self.description,
            "date": self.date.isoformat()
    }