from sqlalchemy import Integer
from datetime import datetime, timezone
from sqlalchemy.orm import Mapped

class EventVolunteer(db.Model):

    __tablename__ = "event_volunteers"

    event_id: Mapped[int] = mapped_column(ForeignKey("events.id"), primary_key=True)
    volunteer_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    joined_at: Mapped[datetime] = mapped_column(DateTime, default=lambda:datetime.now(timezone.utc), nullable=False)

    event = relationship("Event", back_populates="event_volunteers")
    volunteer = relationship("User", back_populates="event_volunteers")