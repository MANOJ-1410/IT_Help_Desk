// import React, { useState } from 'react';
// import { doc, updateDoc } from 'firebase/firestore';
// import  db  from '../../firebase';

// const FeedbackForm = ({ ticket, onFeedbackSubmit }) => {
//   const [feedback, setFeedback] = useState('');
//   const [submitting, setSubmitting] = useState(false);

//   const submitFeedback = async (isResolved) => {
//     setSubmitting(true);
//     try {
//       const ticketRef = doc(db, 'tickets', ticket.id);
      
//       if (isResolved) {
//         // User confirms issue is resolved
//         await updateDoc(ticketRef, {
//           status: 'Closed',
//           userFeedback: feedback || 'Issue confirmed resolved',
//           feedbackFlag: false,
//           closedAt: new Date()
//         });
//         alert('Thank you for your feedback! Ticket has been closed.');
//       } else {
//         // User says issue still exists
//         await updateDoc(ticketRef, {
//           status: 'Reopened',
//           userFeedback: feedback,
//           feedbackFlag: true,
//           reopenedAt: new Date()
//         });
//         alert('Ticket has been reopened. Our IT team will look into it again.');
//       }
      
//       onFeedbackSubmit && onFeedbackSubmit();
//     } catch (error) {
//       console.error('Error submitting feedback:', error);
//       alert('Error submitting feedback');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="feedback-form">
//       <h3>Ticket Resolution Feedback</h3>
//       <div className="ticket-summary">
//         <p><strong>Ticket ID:</strong> {ticket.ticketId}</p>
//         <p><strong>Resolution:</strong> {ticket.resolution}</p>
//         <p><strong>Resolved Date:</strong> {new Date(ticket.resolutionDate?.toDate()).toLocaleDateString()}</p>
//       </div>
      
//       <div className="feedback-section">
//         <label>Additional Comments (Optional):</label>
//         <textarea
//           value={feedback}
//           onChange={(e) => setFeedback(e.target.value)}
//           placeholder="Any additional feedback about the resolution..."
//           rows="3"
//         />
//       </div>
      
//       <div className="feedback-actions">
//         <button 
//           onClick={() => submitFeedback(true)}
//           disabled={submitting}
//           className="resolved-btn"
//         >
//           ✅ Issue Resolved
//         </button>
//         <button 
//           onClick={() => submitFeedback(false)}
//           disabled={submitting}
//           className="problem-btn"
//         >
//           ❌ Still a Problem
//         </button>
//       </div>
//     </div>
//   );
// };

// export default FeedbackForm;