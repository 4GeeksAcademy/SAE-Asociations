from sqlalchemy import String, ForeignKey, Text, DateTime, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from . import db


class Event(db.Model):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    image_url: Mapped[str] = mapped_column(String(500), nullable=True)
    date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    address: Mapped[str] = mapped_column(String(255), nullable=True)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False)
    association_id: Mapped[int] = mapped_column(
        ForeignKey("associations.id"), nullable=False)
    max_volunteers: Mapped[int] = mapped_column(
        Integer, nullable=True, default=None)

    association = relationship("Association", back_populates="events")
    event_volunteers = relationship(
        "EventVolunteer",
        back_populates="event",
        cascade="all, delete-orphan"
    )
    ratings = relationship("Rating", back_populates="event")

    @property
    def volunteers(self):
        return [ev.volunteer for ev in self.event_volunteers]

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "image_url": self.image_url,
            "date": self.date.isoformat(),
            "city": self.city,
            "address": self.address,
            "event_type": self.event_type,
            "is_active": self.is_active,
            "association_id": self.association_id,
            "association_name": self.association.name if self.association else None,
            "association_image_url": self.association.image_url if self.association else None,
            "max_volunteers": self.max_volunteers,
            "Volunteers_count": len(self.event_volunteers),
            "volunteers": [
                {
                    "id": ev.volunteer.id,
                    "name": ev.volunteer.name,
                    "lastname": ev.volunteer.lastname,
                    "profile_image": ev.volunteer.profile_image,
                    "joined_at": ev.joined_at.isoformat()
                }
                for ev in self.event_volunteers
            ]
        }
