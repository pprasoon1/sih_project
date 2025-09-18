import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configure your email transport using credentials from your .env file
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEscalationEmail = async (report, reporter) => {
  const mailOptions = {
    from: `"CivicVoice System" <noreply@civicvoice.com>`,
    to: process.env.DM_EMAIL, // District Magistrate's email from .env
    subject: `[ESCALATED REPORT] #${report._id}: ${report.title}`,
    html: `
      <h1>Escalated Civic Issue Report</h1>
      <p>This report has been escalated for immediate attention by an administrator.</p>
      <hr>
      <h2>Report Details</h2>
      <ul>
        <li><strong>ID:</strong> ${report._id}</li>
        <li><strong>Title:</strong> ${report.title}</li>
        <li><strong>Description:</strong> ${report.description}</li>
        <li><strong>Category:</strong> ${report.category}</li>
        <li><strong>Status:</strong> ${report.status}</li>
        <li><strong>Submitted By:</strong> ${reporter.name} (${reporter.email})</li>
        <li><strong>Date Submitted:</strong> ${new Date(report.createdAt).toLocaleString()}</li>
      </ul>
      <p>View the report image <a href="${report.mediaUrls[0]}">here</a>.</p>
      <p><strong>Location Link:</strong> <a href="https://www.google.com/maps?q=${report.location.coordinates[1]},${report.location.coordinates[0]}">View on Map</a></p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Escalation email sent for report ${report._id}`);
  } catch (error) {
    console.error(`Failed to send escalation email:`, error);
    throw new Error('Email sending failed');
  }
};