import { ConfidentialClientApplication } from '@azure/msal-node';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class MailService {
  private readonly msalClient: ConfidentialClientApplication;
  private readonly tenantId: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly smtpUser: string;
  private readonly mailFrom: string;
  private readonly frontendUrl: string;

  constructor(private readonly configService: ConfigService) {
    const nodeEnv = this.configService.get<string>('NODE_ENV') ?? 'development';

    this.tenantId = this.configService.get<string>('AZURE_TENANT_ID') ?? '';
    this.clientId = this.configService.get<string>('AZURE_CLIENT_ID') ?? '';
    this.clientSecret = this.configService.get<string>('AZURE_CLIENT_SECRET') ?? '';
    this.smtpUser = this.configService.get<string>('SMTP_USER') ?? '';
    this.mailFrom = this.configService.get<string>('MAIL_FROM') ?? this.smtpUser;

    this.frontendUrl =
      nodeEnv === 'production'
        ? this.configService.get<string>('FRONTEND_URL_PROD') ?? ''
        : this.configService.get<string>('FRONTEND_URL_DEV') ?? '';

    this.msalClient = new ConfidentialClientApplication({
      auth: {
        clientId: this.clientId,
        authority: `https://login.microsoftonline.com/${this.tenantId}`,
        clientSecret: this.clientSecret,
      },
    });
  }

  private async getAccessToken(): Promise<string> {
    const result = await this.msalClient.acquireTokenByClientCredential({
      scopes: ['https://graph.microsoft.com/.default'],
    });

    if (!result?.accessToken) {
      throw new InternalServerErrorException('No se pudo obtener el token de Microsoft Graph');
    }

    return result.accessToken;
  }

  private async sendMail(to: string, subject: string, html: string): Promise<void> {
    if (!this.smtpUser) {
      throw new InternalServerErrorException('SMTP_USER no está configurado');
    }

    const accessToken = await this.getAccessToken();
    const userPath = encodeURIComponent(this.smtpUser);

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/users/${userPath}/sendMail`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            subject,
            body: { contentType: 'HTML', content: html },
            toRecipients: [{ emailAddress: { address: to } }],
          },
          saveToSentItems: false,
        }),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      throw new InternalServerErrorException(`Error al enviar correo: ${error}`);
    }
  }

  async sendPasswordResetEmail(user: User, token: string) {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;

    await this.sendMail(
      user.email,
      'Restablece tu contraseña - Intranet Asha',
      `
        <p>Hola ${user.name},</p>
        <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace:</p>
        <a href="${resetUrl}" target="_blank">Restablecer mi contraseña</a>
        <p>Si no solicitaste esto, puedes ignorar este correo.</p>
        <p>El enlace expira en 30 minutos.</p>
      `,
    );
  }

  async sendAccountVerificationEmail(user: User, token: string, temporaryPassword: string) {
    const verificationUrl = `${this.frontendUrl}/verify-account?token=${token}`;

    await this.sendMail(
      user.email,
      '¡Verifica tu cuenta en ASHA solution!',
      `
        <p>¡Hola ${user.name}!</p>
        <p>Te damos la bienvenida a ASHA solution. Por favor, haz clic en el siguiente enlace para verificar tu cuenta:</p>
        <a href="${verificationUrl}" target="_blank">Verificar mi cuenta</a>
        <p>Tu contraseña temporal es: <strong>${temporaryPassword}</strong></p>
        <p>Después de iniciar sesión, te recomendamos cambiarla desde tu perfil.</p>
        <p>Si no te registraste, por favor ignora este correo.</p>
      `,
    );
  }
}