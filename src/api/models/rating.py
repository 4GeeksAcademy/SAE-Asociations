from sqlalchemy import Integer, Float, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from . import db


class Rating(db.Model):
    __tablename__ = "ratings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    rating: Mapped[float] = mapped_column(Float, nullable=False)
    comment: Mapped[str] = mapped_column(Text, nullable=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    association_id: Mapped[int] = mapped_column(Integer, ForeignKey("associations.id"), nullable=False)
    event_id: Mapped[int] = mapped_column(Integer, ForeignKey("events.id"), nullable=False)  # Nuevo campo
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relaciones
    user = relationship("User", back_populates="ratings")
    association = relationship("Association", back_populates="ratings")
    event = relationship("Event", back_populates="ratings")  # Nueva relación

    def serialize(self):
        """Serializar valoración para JSON"""
        return {
            "id": self.id,
            "rating": self.rating,
            "comment": self.comment,
            "user_id": self.user_id,
            "association_id": self.association_id,
            "event_id": self.event_id,  # Nuevo campo
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            
            # Info del usuario que valoró
            "user": {
                "id": self.user.id,
                "name": f"{self.user.name} {self.user.lastname}".strip() if self.user.name else None,
                "email": self.user.email
            } if self.user else None,
            
            # Info de la asociación valorada
            "association": {
                "id": self.association.id,
                "name": self.association.name
            } if self.association else None,
            
            # Info del evento valorado
            "event": {
                "id": self.event.id,
                "title": self.event.title,
                "date": self.event.date.isoformat()
            } if self.event else None
        } 