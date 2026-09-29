import nodemailer from 'nodemailer';
import { IUser, IRoom, IComplaint } from '../db';

// Create reusable transporter
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter configuration
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter.verify((error, success) => {
    if (error) {
      console.log('[Email] Configuration error:', error.message);
    } else {
      console.log('[Email] Service ready to send emails');
    }
  });
}

/**
 * Send room allocation email
 */
export async function sendRoomAllocationEmail(
  student: IUser,
  room: IRoom,
  checkInDate: string,
  checkOutDate: string
): Promise<void> {
  if (!process.env.EMAIL_USER || !student.email) return;

  const roommates = room.occupants
    .filter((occ: any) => occ._id.toString() !== student._id.toString())
    .map((occ: any) => occ.name)
    .join(', ');

  const mailOptions = {
    from: `"Hostel Management" <${process.env.EMAIL_USER}>`,
    to: student.email,
    subject: `Room Allocated - Room ${room.number}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1b4d79; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
            .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #1b4d79; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .btn { display: inline-block; padding: 12px 24px; background: #1b4d79; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏠 Room Allocated!</h1>
            </div>
            <div class="content">
              <p>Dear <strong>${student.name}</strong>,</p>
              <p>Congratulations! You have been successfully allocated to <strong>Room ${room.number}</strong>.</p>
              
              <div class="info-box">
                <h3>📋 Allocation Details:</h3>
                <p><strong>Room Number:</strong> ${room.number}</p>
                <p><strong>Check-in Date:</strong> ${checkInDate}</p>
                <p><strong>Check-out Date:</strong> ${checkOutDate}</p>
                ${roommates ? `<p><strong>Roommate(s):</strong> ${roommates}</p>` : '<p><strong>Roommate:</strong> You will be the first occupant</p>'}
              </div>
              
              <p>Please ensure you check in on the scheduled date with all necessary documents.</p>
              <p>If you have any questions or concerns, please contact the hostel warden.</p>
              
              <a href="${process.env.APP_URL || 'http://localhost:3000'}" class="btn">View Dashboard</a>
            </div>
            <div class="footer">
              <p>Hostel Management System | ${new Date().getFullYear()}</p>
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Email] Room allocation email sent to ${student.email}`);
  } catch (error: any) {
    console.error('[Email] Failed to send room allocation email:', error.message);
  }
}

/**
 * Send complaint resolved email
 */
export async function sendComplaintResolvedEmail(
  student: IUser,
  complaint: any,
  room: IRoom
): Promise<void> {
  if (!process.env.EMAIL_USER || !student.email) return;

  const mailOptions = {
    from: `"Hostel Management" <${process.env.EMAIL_USER}>`,
    to: student.email,
    subject: 'Your Complaint Has Been Resolved',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
            .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #10b981; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .btn { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Complaint Resolved!</h1>
            </div>
            <div class="content">
              <p>Dear <strong>${student.name}</strong>,</p>
              <p>Great news! Your complaint has been marked as <strong>Resolved</strong> by the hostel administration.</p>
              
              <div class="info-box">
                <h3>📝 Complaint Details:</h3>
                <p><strong>Room:</strong> ${room.number}</p>
                <p><strong>Issue:</strong> ${complaint.text}</p>
                <p><strong>Submitted:</strong> ${new Date(complaint.createdAt).toLocaleDateString()}</p>
                <p><strong>Resolved:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              <p>Thank you for reporting the issue and helping us maintain the hostel facilities!</p>
              <p>If you notice any other problems, please don't hesitate to submit a new complaint.</p>
              
              <a href="${process.env.APP_URL || 'http://localhost:3000'}" class="btn">View Dashboard</a>
            </div>
            <div class="footer">
              <p>Hostel Management System | ${new Date().getFullYear()}</p>
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Email] Complaint resolved email sent to ${student.email}`);
  } catch (error: any) {
    console.error('[Email] Failed to send complaint resolved email:', error.message);
  }
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(user: IUser): Promise<void> {
  if (!process.env.EMAIL_USER || !user.email) return;

  const roleDisplay = user.role === 'admin' ? 'Warden/Administrator' : 'Student';

  const mailOptions = {
    from: `"Hostel Management" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Welcome to Hostel Management System',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1b4d79; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
            .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #1b4d79; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .btn { display: inline-block; padding: 12px 24px; background: #1b4d79; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome!</h1>
            </div>
            <div class="content">
              <p>Dear <strong>${user.name}</strong>,</p>
              <p>Welcome to the Hostel Management System! Your account has been successfully created.</p>
              
              <div class="info-box">
                <h3>📋 Account Information:</h3>
                <p><strong>Name:</strong> ${user.name}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Role:</strong> ${roleDisplay}</p>
              </div>
              
              ${user.role === 'student' ? `
              <p><strong>Next Steps:</strong></p>
              <ul>
                <li>Wait for room allocation from the warden</li>
                <li>You'll receive an email once your room is assigned</li>
                <li>Submit maintenance complaints through your dashboard</li>
              </ul>
              ` : `
              <p><strong>Admin Features:</strong></p>
              <ul>
                <li>Manage hostel rooms</li>
                <li>Allocate students to rooms</li>
                <li>Handle maintenance complaints</li>
                <li>View analytics and reports</li>
              </ul>
              `}
              
              <a href="${process.env.APP_URL || 'http://localhost:3000'}" class="btn">Login Now</a>
            </div>
            <div class="footer">
              <p>Hostel Management System | ${new Date().getFullYear()}</p>
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Email] Welcome email sent to ${user.email}`);
  } catch (error: any) {
    console.error('[Email] Failed to send welcome email:', error.message);
  }
}

export default transporter;
