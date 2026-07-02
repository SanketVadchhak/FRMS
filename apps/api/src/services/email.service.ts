export interface EmailOptions {
  to: string | string[];
  subject: string;
  bodyHtml: string;
  from?: string;
}

export class EmailService {
  // In a real production app, you would inject an SESClient or SendGrid API client here
  // constructor(private sesClient: SESClient) {}

  async sendEmail(options: EmailOptions): Promise<void> {
    // Mock implementation for Phase 4
    // Replace with actual email sending logic
    console.log(`[EmailService] Sending email to ${options.to}`);
    console.log(`[EmailService] Subject: ${options.subject}`);
  }
}
