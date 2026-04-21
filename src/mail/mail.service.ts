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
      from: `"Tienda Ropa" <${process.env.GMAIL_USER}>`,
      to,
      subject: 'Recuperación de contraseña',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Recuperar contraseña</title>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
            .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; border-bottom: 2px solid #4CAF50; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #4CAF50; }
            .content { padding: 20px 0; }
            .button { display: inline-block; background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; font-size: 12px; color: #999; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">👕 Tienda Ropa IA</div>
            </div>
            <div class="content">
              <h2>Hola ${nombre},</h2>
              <p>Recibimos una solicitud para restablecer tu contraseña.</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Restablecer contraseña</a>
              </div>
              <p>Si no solicitaste este cambio, ignora este correo.</p>
            </div>
            <div class="footer">
              <p>Este enlace expira en 1 hora.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  }

  async sendPasswordChangedEmail(to: string, nombre: string) {
    await this.transporter.sendMail({
      from: `"Tienda Ropa IA" <${process.env.GMAIL_USER}>`,
      to,
      subject: 'Tu contraseña ha sido cambiada',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Contraseña cambiada</title>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
            .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; border-bottom: 2px solid #4CAF50; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #4CAF50; }
            .content { padding: 20px 0; text-align: center; }
            .success-icon { font-size: 60px; color: #4CAF50; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">👕 Tienda Ropa IA</div>
            </div>
            <div class="content">
              <div class="success-icon">✅</div>
              <h2>¡Contraseña actualizada!</h2>
              <p>Hola ${nombre}, tu contraseña ha sido cambiada exitosamente.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  }
}