import { ConfidentialClientApplication } from '@azure/msal-node';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import * as pug from 'pug';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
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
    try {
      const result = await this.msalClient.acquireTokenByClientCredential({
        scopes: ['https://graph.microsoft.com/.default'],
      });

      if (!result?.accessToken) {
        throw new Error('El resultado de MSAL no contiene un accessToken');
      }

      return result.accessToken;
    } catch (error) {
      this.logger.error('Error obteniendo token de Microsoft Graph', error);
      throw new InternalServerErrorException('No se pudo autenticar con Microsoft Graph');
    }
  }

  private renderTemplate(templateName: string, locals: Record<string, unknown>): string {
    const templatePath = join(__dirname, 'templates', `${templateName}.pug`);
    return pug.renderFile(templatePath, locals);
  }

  private async sendMail(to: string, subject: string, html: string): Promise<void> {
    if (!this.smtpUser) {
      throw new InternalServerErrorException('SMTP_USER no está configurado');
    }

    const accessToken = await this.getAccessToken();
    const userPath = encodeURIComponent(this.smtpUser);

    try {
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
        const errorData = await response.json();
        this.logger.error(`Error detallado de Microsoft Graph: ${JSON.stringify(errorData, null, 2)}`);
        throw new InternalServerErrorException(`Graph API Error: ${errorData.error?.message || 'Error desconocido'}`);
      }
    } catch (error) {
      this.logger.error('Error ejecutando fetch hacia Graph API', error);
      throw new InternalServerErrorException(`Error al enviar el correo: ${error.message}`);
    }
  }

  async sendPasswordResetEmail(user: User, token: string) {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;
    const html = this.renderTemplate('reset-password', {
      name: user.name,
      resetUrl,
    });

    await this.sendMail(
      user.email,
      'Restablece tu contraseña - ASHA Solution',
      html,
    );
  }

  async sendWelcomeEmail(user: User, temporaryPassword: string) {
    const accessUrl = `${this.frontendUrl}/login`;
    const html = this.renderTemplate('welcome', {
      name: user.name,
      email: user.email,
      temporaryPassword,
      accessUrl,
    });

    await this.sendMail(
      user.email,
      '¡Bienvenido/a a ASHA Solution!',
      html,
    );
  }

  /** @deprecated Use sendWelcomeEmail instead */
  async sendAccountVerificationEmail(user: User, token: string, temporaryPassword: string) {
    await this.sendWelcomeEmail(user, temporaryPassword);
  }

  async sendVacationRequestEmail(options: {
    recipientEmail: string;
    recipientName: string;
    employeeName: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    requestDate: string;
    requestUrl: string;
    notes?: string;
  }) {
    const html = this.renderTemplate('vacation-request', {
      recipientName: options.recipientName,
      employeeName: options.employeeName,
      startDate: options.startDate,
      endDate: options.endDate,
      totalDays: options.totalDays,
      requestDate: options.requestDate,
      requestUrl: options.requestUrl,
      notes: options.notes,
    });

    await this.sendMail(
      options.recipientEmail,
      `Nueva solicitud de vacaciones — ${options.employeeName}`,
      html,
    );
  }

  async sendVacationApprovedEmail(options: {
    userEmail: string;
    userName: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    requestUrl: string;
  }) {
    const html = this.renderTemplate('vacation-approved', {
      name: options.userName,
      startDate: options.startDate,
      endDate: options.endDate,
      totalDays: options.totalDays,
      requestUrl: options.requestUrl,
    });

    await this.sendMail(
      options.userEmail,
      '¡Tus vacaciones fueron aprobadas! 🏖️ — ASHA Solution',
      html,
    );
  }
}