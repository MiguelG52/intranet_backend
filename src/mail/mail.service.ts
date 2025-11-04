import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class MailService {
    constructor(private readonly mailerService: MailerService) {}

  /**
   * Envía el correo de restablecimiento de contraseña.
   * @param user El usuario al que se le enviará el correo.
   * @param token El token de restablecimiento.
   */
  async sendPasswordResetEmail(user: User, token: string) {
    const resetUrl = `https://tu-frontend.com/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Restablece tu contraseña - Intranet Asha',
      html: `
        <p>Hola ${user.name},</p>
        <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace:</p>
        <a href="${resetUrl}" target="_blank">Restablecer mi contraseña</a>
        <p>Si no solicitaste esto, puedes ignorar este correo.</p>
        <p>El enlace expira en 30 minutos.</p>
      `,
    });
  }

  /**
   * Envía el correo de verificación de cuenta.
   * @param user El usuario recién creado.
   * @param token El token de verificación.
   */
  async sendAccountVerificationEmail(user: User, token: string) {
    
    const verificationUrl = `https://tu-frontend.com/verify-account?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: '¡Verifica tu cuenta en ASHA solution!',
      html: `
        <p>¡Hola ${user.name}!</p>
        <p>Gracias por registrarte. Por favor, haz clic en el siguiente enlace para verificar tu cuenta:</p>
        <a href="${verificationUrl}" target="_blank">Verificar mi cuenta</a>
        <p>Si no te registraste, por favor ignora este correo.</p>
      `,
    });
  }
}
