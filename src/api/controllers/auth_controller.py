from flask import jsonify
from http import HTTPStatus
import logging
from ..services.auth_service import AuthService
from ..services.association_service import AssociationService
from ..models import db

class AuthController:
    @staticmethod
    def register_user(data: dict):
        # Validate if user already exists
        if AuthService.get_user_by_email(data['email']):
            return jsonify({'message': 'Este email ya está registrado. ¿Quieres iniciar sesión en su lugar?'}), HTTPStatus.CONFLICT
        
        try:
            # Create user
            user = AuthService.create_user(
                email=data['email'],
                password=data['password'],
                name=data.get('name'),
                lastname=data.get('lastname'),
                phone=data.get('phone'),
                profile_image=data.get('profile_image')
            )
            
            # Generate token and get user data with correct role
            auth_data = AuthService.generate_token(user)
            
            return jsonify({
                'message': 'Tu cuenta de voluntario ha sido creada exitosamente. ¡Bienvenido a SAE!',
                'user': auth_data['user'],
                'access_token': auth_data['access_token'],
                'refresh_token': auth_data['refresh_token']
            }), HTTPStatus.CREATED
            
        except Exception as e:
            logging.error(f"User registration error: {str(e)}")
            return jsonify({'message': 'No pudimos crear tu cuenta en este momento. Por favor, inténtalo de nuevo o contacta con soporte si el problema persiste.'}), HTTPStatus.BAD_REQUEST

    @staticmethod
    def register_association(data: dict):
        # Validate if user already exists
        if AuthService.get_user_by_email(data['email']):
            return jsonify({'message': 'Este email ya está registrado. ¿Quieres iniciar sesión en su lugar?'}), HTTPStatus.CONFLICT
            
        # Validate if association CIF already exists
        if AssociationService.get_association_by_cif(data['cif']):
            return jsonify({'message': 'Este CIF ya está registrado por otra asociación. Verifica que sea correcto o contacta con soporte.'}), HTTPStatus.CONFLICT
        
        try:
            # Create user first (without committing to database)
            user = AuthService.create_user(
                email=data['email'],
                password=data['password'],
                name=data.get('name'),
                lastname=data.get('lastname'),
                phone=data.get('phone'),
                commit=False
            )
            
            # Flush to get the user ID but don't commit yet
            db.session.flush()
            
            # Then create association (without committing to database)
            association = AssociationService.create_association(
                name=data['association_name'],
                cif=data['cif'],
                description=data['description'],
                contact_email=data['contact_email'],
                user_id=user.id,
                image_url=data.get('image_url'),
                website_url=data.get('website_url'),
                social_media_url=data.get('social_media_url'),
                contact_phone=data.get('contact_phone'),
                facebook_url=data.get('facebook_url'),
                instagram_url=data.get('instagram_url'),
                twitter_url=data.get('twitter_url'),
                commit=False
            )
            
            # If both operations succeed, commit everything
            db.session.commit()
            
            # Generate token and get user data with correct role
            auth_data = AuthService.generate_token(user)
            
            # Serialize association data
            association_data = {
                'id': association.id,
                'name': association.name,
                'cif': association.cif,
                'description': association.description,
                'contact_email': association.contact_email,
                'image_url': association.image_url,
                'website_url': association.website_url,
                'social_media_url': association.social_media_url,
                'contact_phone': association.contact_phone,
                'facebook_url': association.facebook_url,
                'instagram_url': association.instagram_url,
                'twitter_url': association.twitter_url
            }
            
            return jsonify({
                'message': 'Tu asociación ha sido registrada exitosamente. ¡Ya puedes empezar a gestionar eventos y voluntarios!',
                'user': auth_data['user'],
                'association': association_data,
                'access_token': auth_data['access_token'],
                'refresh_token': auth_data['refresh_token']
            }), HTTPStatus.CREATED
            
        except Exception as e:
            # If any error occurs, rollback the transaction
            db.session.rollback()
            logging.error(f"Association registration error: {str(e)}")
            return jsonify({'message': 'No pudimos registrar tu asociación en este momento. Por favor, verifica todos los datos e inténtalo de nuevo.'}), HTTPStatus.BAD_REQUEST
    
    @staticmethod
    def login(data: dict):
        user = AuthService.get_user_by_email(data['email'])
        
        if not user or not AuthService.check_password(user, data['password']):
            return jsonify({'message': 'Email o contraseña incorrectos. Por favor, verifica tus datos e inténtalo de nuevo.'}), HTTPStatus.UNAUTHORIZED
        
        try:
            auth_data = AuthService.generate_token(user)
            return jsonify({
                'message': '¡Bienvenido de vuelta! Has iniciado sesión correctamente.',
                'user': auth_data['user'],
                'access_token': auth_data['access_token'],
                'refresh_token': auth_data['refresh_token']
            }), HTTPStatus.OK
            
        except Exception as e:
            logging.error(f"Login error: {str(e)}")
            return jsonify({'message': 'Hubo un problema al iniciar sesión. Por favor, inténtalo de nuevo en unos momentos.'}), HTTPStatus.BAD_REQUEST 