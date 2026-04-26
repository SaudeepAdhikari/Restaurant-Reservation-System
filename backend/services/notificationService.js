import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
    return transporter;
  }

  transporter = nodemailer.createTransport({ jsonTransport: true });
  logger.warn('SMTP not configured. Emails will be logged using jsonTransport.');
  return transporter;
}

async function sendMail({ to, subject, html }) {
  if (!to) return;

  try {
    const result = await getTransporter().sendMail({
      from: process.env.EMAIL_FROM || 'noreply@restaurant-reservation.local',
      to,
      subject,
      html
    });
    logger.info(`Email queued: ${subject}`);
    return result;
  } catch (error) {
    logger.error(`Email delivery failed: ${error.message}`);
    return null;
  }
}

export function sendBookingConfirmationEmail({ email, name, restaurantName, date, time, guests }) {
  return sendMail({
    to: email,
    subject: `Booking confirmed at ${restaurantName}`,
    html: `
      <h2>Booking Confirmed</h2>
      <p>Hi ${name || 'Guest'},</p>
      <p>Your reservation is confirmed.</p>
      <ul>
        <li><strong>Restaurant:</strong> ${restaurantName}</li>
        <li><strong>Date:</strong> ${date}</li>
        <li><strong>Time:</strong> ${time}</li>
        <li><strong>Guests:</strong> ${guests}</li>
      </ul>
    `
  });
}

export function sendBookingCancellationEmail({ email, name, restaurantName, date, time }) {
  return sendMail({
    to: email,
    subject: `Booking update for ${restaurantName}`,
    html: `
      <h2>Booking Cancelled</h2>
      <p>Hi ${name || 'Guest'},</p>
      <p>Your reservation at <strong>${restaurantName}</strong> on ${date} at ${time} has been cancelled.</p>
    `
  });
}

export function sendOfferNotificationEmail({ email, name, restaurantName, offerTitle, promoCode }) {
  return sendMail({
    to: email,
    subject: `New offer from ${restaurantName}`,
    html: `
      <h2>New Offer Available</h2>
      <p>Hi ${name || 'Guest'},</p>
      <p><strong>${restaurantName}</strong> has a new offer: <strong>${offerTitle}</strong>.</p>
      ${promoCode ? `<p>Promo Code: <strong>${promoCode}</strong></p>` : ''}
    `
  });
}
