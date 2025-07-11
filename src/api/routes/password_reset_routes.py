from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import os
import secrets
from api.models import db, User, Association
from api.services.email_service import send_email

password_reset_bp = Blueprint('password_reset_bp', __name__)


@password_reset_bp.route('/forgot-password', methods=['POST'])
def forgot_password_request():
    email = request.json.get('email', None)
    if not email:
        return jsonify({"error": "Debe proporcionar un email"}), 400

    user = User.query.filter_by(email=email).first()
    association = Association.query.filter_by(contact_email=email).first()

    target_user = user if user else association

    if target_user:
        reset_token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(hours=1)

        target_user.reset_token = reset_token
        target_user.reset_token_expires_at = expires_at
        db.session.commit()

        frontend_base_url = os.getenv('FRONTEND_URL')
        reset_link = f"{frontend_base_url}/reset-password/{reset_token}"

        # Determinar qué email usar para enviar el correo
        if isinstance(target_user, User):
            recipient_email = target_user.email
        elif isinstance(target_user, Association):
            recipient_email = target_user.contact_email
        else:
            print("ADVERTENCIA: Tipo de usuario desconocido para envío de correo.")
            return jsonify({"message": "Si tu email está registrado, recibirás un enlace para restablecer tu contraseña."}), 200

        email_body = f"""
        <html>
            <body>
                <p>Hola,</p>
                <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
                <p><a href="{reset_link}">Restablecer mi contraseña</a></p>
                <p>Este enlace expirará en 1 hora.</p>
                <p>Si no solicitaste un restablecimiento de contraseña, ignora este correo.</p>
                <p>Saludos,</p>
                <p>Tu equipo de SAE-Asociations</p>
            </body>
        </html>
        """
        email_sent = send_email(to_email=recipient_email,
                                subject="Restablecimiento de Contraseña para SAE-Asociations",
                                body_html=email_body)

        if not email_sent:
            print(
                f"ADVERTENCIA: No se pudo enviar el correo de recuperación a {target_user.email}. El token se generó y guardó.")

    return jsonify({"message": "Si tu email está registrado, recibirás un enlace para restablecer tu contraseña."}), 200


@password_reset_bp.route('/reset-password/<token>', methods=['POST'])
def reset_password_confirm(token):
    new_password = request.json.get('new_password', None)
    confirm_new_password = request.json.get('confirm_new_password', None)

    if not new_password or not confirm_new_password:
        return jsonify({"error": "Debe proporcionar y confirmar la nueva contraseña."}), 400

    if new_password != confirm_new_password:
        return jsonify({"error": "Las contraseñas no coinciden."}), 400

    if len(new_password) < 6:  
        return jsonify({"error": "La contraseña debe tener al menos 6 caracteres."}), 400

    user = User.query.filter_by(reset_token=token).first()
    association = Association.query.filter_by(reset_token=token).first()

    target_user = user if user else association

    if not target_user:
        return jsonify({"error": "Token de restablecimiento inválido o ya utilizado."}), 400

    if datetime.utcnow() > target_user.reset_token_expires_at:
        return jsonify({"error": "El token de restablecimiento ha expirado. Por favor, solicita uno nuevo."}), 400

    target_user.set_password(new_password)

    target_user.reset_token = None
    target_user.reset_token_expires_at = None

    db.session.commit()

    return jsonify({"message": "Contraseña actualizada exitosamente."}), 200
