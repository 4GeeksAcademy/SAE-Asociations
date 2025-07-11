from sqlalchemy import String, ForeignKey, Numeric, DateTime, Text, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from enum import Enum as PyEnum
from . import db

class DonationStatus(PyEnum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"

class Donation(db.Model):
    __tablename__ = 'donations'
    
    id: Mapped[int] = mapped_column(primary_key=True)
    
    # Información básica de la donación
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default='EUR', nullable=False) 
    description: Mapped[str] = mapped_column(Text, nullable=True)
    
    # Relaciones (quién donó a quién)
    donor_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False)
    association_id: Mapped[int] = mapped_column(ForeignKey('associations.id'), nullable=False)
    event_id: Mapped[int] = mapped_column(ForeignKey('events.id'), nullable=True)  # Opcional
    
    # Stripe info
    stripe_session_id: Mapped[str] = mapped_column(String(255), nullable=True)
    status: Mapped[DonationStatus] = mapped_column(SQLEnum(DonationStatus), default=DonationStatus.PENDING, nullable=False)
    
    # Fechas importantes  
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    completed_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    
    # Relaciones para obtener info completa
    donor = relationship("User", foreign_keys=[donor_id])
    association = relationship("Association", foreign_keys=[association_id])
    event = relationship("Event", foreign_keys=[event_id])

    def __init__(self, amount, donor_id, association_id, event_id=None, description=None):
        self.amount = amount
        self.donor_id = donor_id
        self.association_id = association_id
        self.event_id = event_id
        self.description = description

    def serialize(self):
        """Toda la información que necesitas ver"""
        return {
            "id": self.id,
            "amount": float(self.amount),
            "currency": self.currency,
            "description": self.description,
            "status": self.status.value,
            
            # Info del donante
            "donor": {
                "id": self.donor.id,
                "name": self.donor.association.name if self.donor.association else f"{self.donor.name} {self.donor.lastname}".strip(),
                "email": self.donor.email
            } if self.donor else None,
            
            # Info de la asociación 
            "association": {
                "id": self.association.id,
                "name": self.association.name
            } if self.association else None,
            
            # Info del evento (si aplicable)
            "event": {
                "id": self.event.id, 
                "title": self.event.title
            } if self.event else None,
            
            # Fechas importantes (con timezone UTC)
            "created_at": self.created_at.isoformat() + 'Z' if self.created_at else None,
            "completed_at": self.completed_at.isoformat() + 'Z' if self.completed_at else None,
            
            # Info de Stripe
            "stripe_session_id": self.stripe_session_id
        }

    def complete_donation(self):
        """Marcar donación como completada"""
        self.status = DonationStatus.COMPLETED
        self.completed_at = datetime.now(timezone.utc) 