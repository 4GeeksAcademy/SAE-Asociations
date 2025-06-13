from flask import jsonify
from http import HTTPStatus
from ..services.auth_service import AuthService
from ..services.association_service import AssociationService

class AuthController:
    @staticmethod
    def register_user(data: dict):
        # Validate if user already exists
        if AuthService.get_user_by_email(data['email']):
            return jsonify({'message': 'Email already registered'}), HTTPStatus.CONFLICT
        
        try:
            # Create user
            user = AuthService.create_user(
                email=data['email'],
                password=data['password'],
                name=data.get('name'),
                lastname=data.get('lastname'),
                phone=data.get('phone')
            )
            
            # Generate token
            auth_data = AuthService.generate_token(user)
            
            # Serialización simple 4Geeks - convertir a diccionario
            user_data = {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'lastname': user.lastname,
                'phone': user.phone,
                'role': 'volunteer'  # Rol por defecto para usuarios
            }
            
            return jsonify({
                'message': 'User registered successfully',
                'user': user_data,
                'token': auth_data['token']
            }), HTTPStatus.CREATED
            
        except Exception as e:
            return jsonify({'message': str(e)}), HTTPStatus.BAD_REQUEST

    @staticmethod
    def register_association(data: dict):
        # Validate if user already exists
        if AuthService.get_user_by_email(data['email']):
            return jsonify({'message': 'Email already registered'}), HTTPStatus.CONFLICT
            
        # Validate if association CIF already exists
        if AssociationService.get_association_by_cif(data['cif']):
            return jsonify({'message': 'CIF already registered'}), HTTPStatus.CONFLICT
        
        try:
            # Create user first
            user = AuthService.create_user(
                email=data['email'],
                password=data['password'],
                name=data.get('name'),
                lastname=data.get('lastname'),
                phone=data.get('phone')
            )
            
            # Then create association
            association = AssociationService.create_association(
                name=data['association_name'],  # Usar association_name del formulario
                cif=data['cif'],
                description=data['description'],
                contact_email=data['contact_email'],
                user_id=user.id,
                image_url=data.get('image_url'),
                website_url=data.get('website_url'),
                social_media_url=data.get('social_media_url'),
                contact_phone=data.get('contact_phone')
            )
            
            # Generate token
            auth_data = AuthService.generate_token(user)
            
            # Serialización simple 4Geeks - convertir a diccionarios
            user_data = {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'lastname': user.lastname,
                'phone': user.phone,
                'role': 'association'  # Rol para usuarios de asociación
            }
            
            association_data = {
                'id': association.id,
                'name': association.name,
                'cif': association.cif,
                'description': association.description,
                'contact_email': association.contact_email,
                'image_url': association.image_url,
                'website_url': association.website_url,
                'social_media_url': association.social_media_url,
                'contact_phone': association.contact_phone
            }
            
            return jsonify({
                'message': 'Association registered successfully',
                'user': user_data,
                'association': association_data,
                'token': auth_data['token']
            }), HTTPStatus.CREATED
            
        except Exception as e:
            return jsonify({'message': str(e)}), HTTPStatus.BAD_REQUEST
    
    @staticmethod
    def login(data: dict):
        user = AuthService.get_user_by_email(data['email'])
        
        if not user or not AuthService.check_password(user, data['password']):
            return jsonify({'message': 'Invalid credentials'}), HTTPStatus.UNAUTHORIZED
        
        try:
            auth_data = AuthService.generate_token(user)
            return jsonify({
                'message': 'Login successful',
                'user': auth_data['user'],
                'token': auth_data['token']
            }), HTTPStatus.OK
            
        except Exception as e:
            return jsonify({'message': str(e)}), HTTPStatus.BAD_REQUEST 