import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,      
        pass: process.env.GMAIL_APP_PASSWORD, 
      },
    });
  }

  async sendPasswordResetEmail(to: string, token: string, nombre: string) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await this.transporter.sendMail({
      from: `"Velvet" <${process.env.GMAIL_USER}>`,
      to,
      subject: 'Recuperación de contraseña - Velvet',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Recuperar contraseña - Velvet</title>
          <style>
            body {
              font-family: 'Georgia', 'Times New Roman', Times, serif;
              background-color: #f8f9fa;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 550px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 16px;
              padding: 0;
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
              text-align: center;
              padding: 2rem;
            }
            .logo {
              font-size: 28px;
              font-weight: 600;
              letter-spacing: 2px;
              color: #c9a96e;
              margin-bottom: 0.5rem;
            }
            .logo span {
              font-size: 14px;
              font-weight: 300;
              letter-spacing: 4px;
              display: block;
              color: rgba(255, 255, 255, 0.7);
            }
            .content {
              padding: 2rem;
            }
            h2 {
              color: #1a1a1a;
              font-size: 1.5rem;
              margin-top: 0;
              margin-bottom: 1rem;
              font-weight: 500;
            }
            .greeting {
              color: #c9a96e;
              font-weight: 500;
            }
            p {
              color: #555;
              line-height: 1.6;
              margin-bottom: 1.5rem;
            }
            .button-container {
              text-align: center;
              margin: 2rem 0;
            }
            .button {
              display: inline-block;
              background: #c9a96e;
              color: #1a1a1a !important;
              text-decoration: none;
              padding: 12px 32px;
              border-radius: 40px;
              font-weight: 600;
              font-size: 0.9rem;
              transition: all 0.3s ease;
              letter-spacing: 0.5px;
            }
            .button:hover {
              background: #b8965d;
              transform: translateY(-2px);
            }
            .divider {
              height: 1px;
              background: #eaeaea;
              margin: 1.5rem 0;
            }
            .footer {
              background: #fafafa;
              padding: 1.5rem;
              text-align: center;
              font-size: 0.75rem;
              color: #999;
              border-top: 1px solid #eaeaea;
            }
            .footer a {
              color: #c9a96e;
              text-decoration: none;
            }
            .expiry-note {
              font-size: 0.7rem;
              color: #aaa;
              text-align: center;
              margin-top: 1rem;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">
                VELVET
                <span>Elegancia que Seduce</span>
              </div>
            </div>
            <div class="content">
              <h2>Hola, <span class="greeting">${nombre}</span></h2>
              <p>Recibimos una solicitud para restablecer tu contraseña. Si fuiste tú, haz clic en el botón de abajo para crear una nueva contraseña.</p>
              
              <div class="button-container">
                <a href="${resetUrl}" class="button">Restablecer contraseña</a>
              </div>
              
              <p>Si no solicitaste este cambio, puedes ignorar este correo electrónico. Tu contraseña seguirá siendo la misma.</p>
              
              <div class="divider"></div>
              
              <p style="font-size: 0.8rem; color: #888;">
                Este enlace expirará en <strong>15 minutos</strong> por razones de seguridad.
              </p>
            </div>
            <div class="footer">
              <p>© 2024 Velvet - Todos los derechos reservados</p>
              <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  }

  async sendPasswordChangedEmail(to: string, nombre: string) {
    await this.transporter.sendMail({
      from: `"Velvet" <${process.env.GMAIL_USER}>`,
      to,
      subject: 'Contraseña actualizada - Velvet',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Contraseña actualizada - Velvet</title>
          <style>
            body {
              font-family: 'Georgia', 'Times New Roman', Times, serif;
              background-color: #f8f9fa;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 550px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 16px;
              padding: 0;
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
              text-align: center;
              padding: 2rem;
            }
            .logo {
              font-size: 28px;
              font-weight: 600;
              letter-spacing: 2px;
              color: #c9a96e;
              margin-bottom: 0.5rem;
            }
            .logo span {
              font-size: 14px;
              font-weight: 300;
              letter-spacing: 4px;
              display: block;
              color: rgba(255, 255, 255, 0.7);
            }
            .content {
              padding: 2rem;
              text-align: center;
            }
            .success-icon {
              font-size: 64px;
              color: #10b981;
              margin-bottom: 1rem;
            }
            h2 {
              color: #1a1a1a;
              font-size: 1.5rem;
              margin-top: 0;
              margin-bottom: 1rem;
              font-weight: 500;
            }
            .greeting {
              color: #c9a96e;
              font-weight: 500;
            }
            p {
              color: #555;
              line-height: 1.6;
              margin-bottom: 1.5rem;
            }
            .divider {
              height: 1px;
              background: #eaeaea;
              margin: 1.5rem 0;
            }
            .footer {
              background: #fafafa;
              padding: 1.5rem;
              text-align: center;
              font-size: 0.75rem;
              color: #999;
              border-top: 1px solid #eaeaea;
            }
            .footer a {
              color: #c9a96e;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">
                VELVET
                <span>Elegancia que Seduce</span>
              </div>
            </div>
            <div class="content">
              <div class="success-icon">✓</div>
              <h2>¡Contraseña actualizada!</h2>
              <p>Hola, <span class="greeting">${nombre}</span></p>
              <p>Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.</p>
              
              <div class="divider"></div>
              
              <p style="font-size: 0.8rem; color: #888;">
                Si no realizaste este cambio, por favor contacta a nuestro soporte inmediatamente.
              </p>
            </div>
            <div class="footer">
              <p>© 2024 Velvet - Todos los derechos reservados</p>
              <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  }
}