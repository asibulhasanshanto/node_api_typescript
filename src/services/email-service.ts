import nodemailer from 'nodemailer';
import emailTemplate from '../utils/email-template';

interface User {
  email: string;
  name: string;
}

export default class Email {
  to: string;
  firstName: string;
  url: string;
  from: string;

  constructor(user: User, url: string) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `${process.env.APP_NAME} <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Sendgrid
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    } as nodemailer.TransportOptions);
  }

  // Send the actual email
  async send(template: string, subject: string) {
    // Define email options
    const mailOptions: nodemailer.SendMailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html: template,
    };

    // Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendVerifyEmail() {
    const title = 'Confirm Your Email Address';
    const description = `Tap the button below to confirm your email address. If you didn't create an account, you can safely delete this email.`;
    const buttonText = 'Verify Email Address';

    const template = emailTemplate({ title, description, buttonText, name: this.firstName, url: this.url });

    await this.send(template, 'Verify Email Address');
  }

  async sendPasswordReset() {
    const title = 'Reset Your Password';
    const description = `Tap the button below to reset your customer account password. If you didn't request a new password, you can safely delete this email.`;
    const buttonText = 'Reset Password';

    const template = emailTemplate({ title, description, buttonText, name: this.firstName, url: this.url });

    await this.send(
      template,
      `Your password reset token (valid for only ${process.env.PASSWORD_RESET_TOKEN_EXPIRES_IN} minutes)`
    );
  }

  async sendUserInfoEmail(email: string, password: string) {
    const title = 'User Account Created';
    const description = `A new account has been created to our system by the admin. Please login to your account by the credentials below and don't forget to change your password. Your email is: <b>${email}</b> and your password is: <b>${password}</b>`;
    const buttonText = 'Go to Login Page';

    const template = emailTemplate({ title, description, buttonText, name: this.firstName, url: this.url });

    await this.send(template, `Account Created`);
  }
}
