from sqlalchemy import String, ForeignKey, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from . import db


class Event(db.Model):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    image_url: Mapped[str] = mapped_column(String(500), nullable=True)
    date: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    association_id: Mapped[int] = mapped_column(ForeignKey("associations.id"), nullable=False)
    volunteer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True)

    association = relationship ("Association", backref="events")  
    volunteer = relationship ("User", backref="volunteered_events")

    def serializa(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "image_url": self.image_url,
            "date": self.date.isoformat(),
            "association_id": self.association_id,
            "association_name": self.association.name if self.association else None,
            "volunteer_id": self.volunteer_id,
            "volunteer_name": f"{self.volunteer.name} {self.volunteer.lastname}" if self.volunteer else None
        }