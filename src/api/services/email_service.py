import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

# Obtener las variables de entorno para SendGrid
SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY')
SENDGRID_SENDER_EMAIL = os.getenv('SENDGRID_SENDER_EMAIL')

def send_email(to_email, subject, body_html):
        
    if not (SENDGRID_API_KEY and SENDGRID_SENDER_EMAIL):
        print("ADVERTENCIA: Configuración de SendGrid incompleta en email_service.py. No se enviará el correo.")
        return False

    try:
        message = Mail(
            from_email=SENDGRID_SENDER_EMAIL,
            to_emails=to_email,
            subject=subject,
            html_content=body_html
        )
        sendgrid_client = SendGridAPIClient(SENDGRID_API_KEY)
        response = sendgrid_client.send(message)

        if 200 <= response.status_code < 300:
            print(f"Correo enviado a {to_email} con SendGrid. Status Code: {response.status_code}")
            return True
        else:
            print(f"Error al enviar correo a {to_email} con SendGrid. Status Code: {response.status_code}")
            print(f"Response Body: {response.body}")
            return False

    except Exception as e:
        print(f"Error general al enviar correo a {to_email} con SendGrid: {e}")
        return False
