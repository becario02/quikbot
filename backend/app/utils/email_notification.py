from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib
from datetime import datetime
import logging
from app.config import settings
import ssl

class EmailNotifier:
    def __init__(self):
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        self.sender_email = settings.NOTIFICATION_EMAIL
        self.sender_password = settings.NOTIFICATION_EMAIL_PASSWORD

    async def send_quota_exceeded_notification(self, error_details: str):
        try:
            message = MIMEMultipart()
            message["From"] = self.sender_email
            message["To"] = "alexislozadasalinas11@gmail.com"
            message["Subject"] = "⚠️ ALERTA: Cuota de OpenAI Excedida"

            html = f"""
            <html>
                <body style="font-family: Arial, sans-serif;">
                    <div style="padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
                        <h2 style="color: #dc3545;">⚠️ Alerta: Cuota de OpenAI Excedida</h2>
                        <p style="color: #666;">Se ha detectado que la cuota de OpenAI ha sido excedida.</p>
                        <h3 style="color: #333;">Detalles del Error:</h3>
                        <pre style="background-color: #f1f1f1; padding: 15px; border-radius: 5px;">
{error_details}
                        </pre>
                        <p><strong>Fecha y Hora:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                        <hr style="border: 1px solid #eee;">
                        <p style="color: #666;">Por favor, verifica el plan y los detalles de facturación en la plataforma de OpenAI.</p>
                        <p><a href="https://platform.openai.com/account/billing" 
                              style="background-color: #0066cc; color: white; padding: 10px 20px; 
                                     text-decoration: none; border-radius: 5px; display: inline-block;">
                           Revisar Facturación
                        </a></p>
                    </div>
                </body>
            </html>
            """

            message.attach(MIMEText(html, "html"))

            # Crear un contexto SSL seguro
            context = ssl.create_default_context()

            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.ehlo()  # Identificarse con el servidor
                server.starttls(context=context)  # Activar el modo TLS seguro
                server.ehlo()  # Volver a identificarse en modo TLS
                server.login(self.sender_email, self.sender_password)
                server.send_message(message)

            logging.info("Notificación de cuota excedida enviada exitosamente")
        except Exception as e:
            logging.error(f"Error al enviar la notificación por correo: {str(e)}")
            # Agregar más detalles del error para diagnóstico
            logging.error(f"Detalles de configuración: SMTP Server: {self.smtp_server}, Port: {self.smtp_port}")
            logging.error(f"Sender Email: {self.sender_email}")

email_notifier = EmailNotifier()