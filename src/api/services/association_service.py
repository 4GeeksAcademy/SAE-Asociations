from typing import Optional
from ..models import Association, db

class AssociationService:
    @staticmethod
    def create_association(
        name: str,
        cif: str,
        description: str,
        contact_email: str,
        user_id: int,
        image_url: Optional[str] = None,
        website_url: Optional[str] = None,
        social_media_url: Optional[str] = None,
        contact_phone: Optional[str] = None
    ) -> Association:
        association = Association(
            name=name,
            cif=cif,
            description=description,
            contact_email=contact_email,
            user_id=user_id,
            image_url=image_url,
            website_url=website_url,
            social_media_url=social_media_url,
            contact_phone=contact_phone
        )
        db.session.add(association)
        db.session.commit()
        return association
    
    @staticmethod
    def get_association_by_cif(cif: str) -> Optional[Association]:
        return Association.query.filter_by(cif=cif).first()
    
    @staticmethod
    def get_association_by_user_id(user_id: int) -> Optional[Association]:
        return Association.query.filter_by(user_id=user_id).first() 