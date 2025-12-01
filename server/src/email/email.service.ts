import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

interface MailResult {
  messageId?: string;
}

@Injectable()
export class EmailService {
  private readonly transporter: nodemailer.Transporter<MailResult>;
  private readonly fromAddress: string;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    this.fromAddress = process.env.EMAIL_FROM ?? 'no-reply@turtur.tech';

    if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
      const smtpConfig: SMTPTransport.Options = {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        auth: process.env.SMTP_USER
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            }
          : undefined,
      };
      this.transporter = nodemailer.createTransport<MailResult>(smtpConfig);
    } else {
      this.logger.warn(
        'SMTP not configured, using JSON transport (emails will not be delivered)',
      );
      this.transporter = nodemailer.createTransport<MailResult>({
        jsonTransport: true,
      } as nodemailer.TransportOptions);
    }
  }

  async send(
    to: string,
    subject: string,
    html: string,
  ): Promise<{ messageId: string }> {
    const info = await this.transporter.sendMail({
      from: this.fromAddress,
      to,
      subject,
      html,
    });
    return { messageId: info.messageId ?? 'queued' };
  }
}
