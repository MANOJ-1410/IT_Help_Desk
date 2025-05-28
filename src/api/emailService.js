// // emailService.js - Backend API endpoint
// const express = require('express');
// const nodemailer = require('nodemailer');
// const router = express.Router();

// // Email configuration
// const transporter = nodemailer.createTransporter({
//   host: 'smtp.gmail.com', // or your SMTP server
//   port: 587,
//   secure: false,
//   auth: {
//     user: process.env.EMAIL_USER, // your email
//     pass: process.env.EMAIL_PASS  // your app password
//   }
// });

// // Manager email addresses by location
// const MANAGER_EMAILS = {
//   'Corporate Office': ['raghava.bk@manjushreeventures.com'],
//   'Capital-A': ['raghava.bk@manjushreeventures.com'],
//   'Spuntek': ['raghava.bk@manjushreeventures.com'],
//   'Packtek': ['raghava.bk@manjushreeventures.com']
// };

// // Email template for new ticket notification
// const generateTicketEmailHTML = (ticketData) => {
//   return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <style>
//         body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//         .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//         .header { background: linear-gradient(135deg, #334155, #475569); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
//         .content { background: #f8f9fa; padding: 20px; border: 1px solid #e9ecef; }
//         .footer { background: #e9ecef; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; }
//         .ticket-id { background: #fff; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 18px; font-weight: bold; color: #059669; }
//         .details { background: white; padding: 15px; border-radius: 4px; margin: 15px 0; }
//         .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
//         .label { font-weight: bold; color: #6b7280; }
//         .value { color: #374151; }
//         .urgent { color: #dc2626; font-weight: bold; }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <div class="header">
//           <h1>🎫 New IT Support Ticket Submitted</h1>
//           <p>A new support request has been created and requires attention.</p>
//         </div>
        
//         <div class="content">
//           <div class="ticket-id">
//             Ticket ID: ${ticketData.ticket_id}
//           </div>
          
//           <div class="details">
//             <h3>📋 Ticket Details</h3>
//             <div class="row">
//               <span class="label">Employee Name:</span>
//               <span class="value">${ticketData.name}</span>
//             </div>
//             <div class="row">
//               <span class="label">Employee ID:</span>
//               <span class="value">${ticketData.emp_id}</span>
//             </div>
//             <div class="row">
//               <span class="label">Email:</span>
//               <span class="value">${ticketData.email}</span>
//             </div>
//             <div class="row">
//               <span class="label">Location:</span>
//               <span class="value">${ticketData.location}</span>
//             </div>
//             <div class="row">
//               <span class="label">Status:</span>
//               <span class="value" style="color: #2563eb; font-weight: bold;">${ticketData.status}</span>
//             </div>
//             <div class="row">
//               <span class="label">Submitted:</span>
//               <span class="value">${new Date().toLocaleString()}</span>
//             </div>
//           </div>
          
//           <div class="details">
//             <h3>📝 Issue Description</h3>
//             <p style="background: #f1f5f9; padding: 15px; border-radius: 4px; margin: 10px 0;">
//               ${ticketData.issue_desc}
//             </p>
//           </div>
          
//           ${ticketData.attachments && ticketData.attachments.length > 0 ? `
//           <div class="details">
//             <h3>📎 Attachments (${ticketData.attachments.length})</h3>
//             <ul>
//               ${ticketData.attachments.map(att => `
//                 <li><a href="${att.url}" target="_blank">${att.original_filename}</a></li>
//               `).join('')}
//             </ul>
//           </div>
//           ` : ''}
//         </div>
        
//         <div class="footer">
//           <p><strong>Action Required:</strong> Please review and assign this ticket in the IT management system.</p>
//           <p style="font-size: 12px; color: #6b7280;">
//             This is an automated notification from the IT Support System.
//           </p>
//         </div>
//       </div>
//     </body>
//     </html>
//   `;
// };

// // API endpoint to send email notification
// router.post('/send-ticket-notification', async (req, res) => {
//   try {
//     const { ticketData } = req.body;
    
//     if (!ticketData) {
//       return res.status(400).json({ error: 'Ticket data is required' });
//     }

//     // Get manager emails for the location
//     const managerEmails = MANAGER_EMAILS[ticketData.location] || ['default-manager@company.com'];
    
//     // Prepare email options
//     const mailOptions = {
//       from: {
//         name: 'IT Support System',
//         address: process.env.EMAIL_USER
//       },
//       to: managerEmails,
//       cc: ['it-support@company.com'], // Optional: CC to IT support team
//       subject: `🎫 New IT Ticket: ${ticketData.ticket_id} - ${ticketData.location}`,
//       html: generateTicketEmailHTML(ticketData),
//       // Text fallback
//       text: `
//         New IT Support Ticket Submitted
        
//         Ticket ID: ${ticketData.ticket_id}
//         Employee: ${ticketData.name} (${ticketData.emp_id})
//         Email: ${ticketData.email}
//         Location: ${ticketData.location}
//         Status: ${ticketData.status}
        
//         Issue Description:
//         ${ticketData.issue_desc}
        
//         Submitted: ${new Date().toLocaleString()}
//       `
//     };

//     // Send email
//     const info = await transporter.sendMail(mailOptions);
    
//     console.log('✅ Email sent successfully:', info.messageId);
//     res.status(200).json({ 
//       success: true, 
//       message: 'Email notification sent successfully',
//       messageId: info.messageId 
//     });

//   } catch (error) {
//     console.error('❌ Error sending email:', error);
//     res.status(500).json({ 
//       error: 'Failed to send email notification',
//       details: error.message 
//     });
//   }
// });

// // Test email endpoint (optional)
// router.post('/test-email', async (req, res) => {
//   try {
//     const testMail = {
//       from: process.env.EMAIL_USER,
//       to: 'test@company.com',
//       subject: 'Test Email from IT Support System',
//       text: 'This is a test email to verify email configuration.'
//     };

//     await transporter.sendMail(testMail);
//     res.status(200).json({ message: 'Test email sent successfully' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// module.exports = router;








// src/api/emailService.js - EmailJS integration for React + Firebase
import emailjs from 'emailjs-com';

// EmailJS configuration
const EMAILJS_CONFIG = {
  serviceId: process.env.REACT_APP_EMAILJS_SERVICE_ID || 'your_service_id',
  assignmentTemplateId: process.env.REACT_APP_EMAILJS_ASSIGNMENT_TEMPLATE_ID || 'assignment_template_id',
  userId: process.env.REACT_APP_EMAILJS_USER_ID || 'your_user_id'
};

/**
 * Send email notification to assignee when ticket is assigned
 * @param {Object} ticketData - The ticket information
 * @param {string} assigneeEmail - Email of the person assigned to the ticket
 * @param {string} assigneeName - Name of the person assigned to the ticket
 * @param {string} managerName - Name of the manager who assigned the ticket
 */
export const sendAssignmentNotification = async (ticketData, assigneeEmail, assigneeName, managerName) => {
  try {
    const templateParams = {
      // Assignee details
      to_email: assigneeEmail,
      to_name: assigneeName,
      
      // Ticket details
      ticket_id: ticketData.ticket_id,
      ticket_status: ticketData.status || 'Assigned',
      
      // User/Requestor details
      user_name: ticketData.name,
      user_email: ticketData.email,
      user_emp_id: ticketData.emp_id,
      user_location: ticketData.location,
      
      // Issue details
      issue_description: ticketData.issue_desc,
      priority: ticketData.priority || 'Medium',
      category: ticketData.category || 'General',
      
      // Assignment details
      assigned_by: managerName,
      assigned_date: new Date().toLocaleDateString(),
      assigned_time: new Date().toLocaleTimeString(),
      
      // Additional info
      due_date: ticketData.due_date || 'Not specified',
      attachments_count: ticketData.attachments ? ticketData.attachments.length : 0,
      
      // Email subject
      subject: `🎫 Ticket Assigned: ${ticketData.ticket_id} - ${ticketData.location}`,
      
      // HTML formatted description for better email display
      formatted_description: ticketData.issue_desc?.replace(/\n/g, '<br>') || 'No description provided'
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.assignmentTemplateId,
      templateParams,
      EMAILJS_CONFIG.userId
    );

    console.log('✅ Assignment notification sent successfully:', response);
    return {
      success: true,
      message: 'Assignment notification sent successfully',
      response: response
    };

  } catch (error) {
    console.error('❌ Error sending assignment notification:', error);
    return {
      success: false,
      error: 'Failed to send assignment notification',
      details: error.message
    };
  }
};

/**
 * Send email notification when ticket status is updated
 * @param {Object} ticketData - The ticket information
 * @param {string} assigneeEmail - Email of the assignee
 * @param {string} assigneeName - Name of the assignee
 * @param {string} oldStatus - Previous status
 * @param {string} newStatus - New status
 * @param {string} updatedBy - Who updated the status
 */
export const sendStatusUpdateNotification = async (ticketData, assigneeEmail, assigneeName, oldStatus, newStatus, updatedBy) => {
  try {
    const templateParams = {
      to_email: assigneeEmail,
      to_name: assigneeName,
      ticket_id: ticketData.ticket_id,
      old_status: oldStatus,
      new_status: newStatus,
      updated_by: updatedBy,
      updated_date: new Date().toLocaleDateString(),
      updated_time: new Date().toLocaleTimeString(),
      user_name: ticketData.name,
      issue_description: ticketData.issue_desc,
      subject: `📋 Status Update: ${ticketData.ticket_id} - ${oldStatus} → ${newStatus}`
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      'status_update_template_id', // You'll need to create this template too
      templateParams,
      EMAILJS_CONFIG.userId
    );

    console.log('✅ Status update notification sent:', response);
    return {
      success: true,
      message: 'Status update notification sent successfully',
      response: response
    };

  } catch (error) {
    console.error('❌ Error sending status update notification:', error);
    return {
      success: false,
      error: 'Failed to send status update notification',
      details: error.message
    };
  }
};

/**
 * Utility function to validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Export the main function for backward compatibility
export default sendAssignmentNotification;