// import React from 'react';
// import StatusBadge from './StatusBadge';

// const TicketCard = ({ ticket, showActions = false, onAssign, onView }) => {
//   const formatDate = (timestamp) => {
//     if (!timestamp) return 'N/A';
//     try {
//       const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
//       return date.toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit'
//       });
//     } catch (error) {
//       return 'Invalid Date';
//     }
//   };

//   const getPriorityColor = (priority) => {
//     switch (priority?.toLowerCase()) {
//       case 'high':
//         return 'text-red-600 bg-red-100';
//       case 'medium':
//         return 'text-amber-600 bg-amber-100';
//       case 'low':
//         return 'text-green-600 bg-green-100';
//       default:
//         return 'text-slate-600 bg-slate-100';
//     }
//   };

//   const truncateText = (text, maxLength = 100) => {
//     if (!text || text.length <= maxLength) return text;
//     return text.substring(0, maxLength) + '...';
//   };

//   return (
//     <div className="bg-white rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
//       {/* Card Header */}
//       <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-3">
//             <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
//               <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
//               </svg>
//             </div>
//             <div>
//               <h3 className="text-lg font-bold text-slate-800">#{ticket.ticketId}</h3>
//               <p className="text-sm text-slate-500">
//                 {formatDate(ticket.createdAt)}
//               </p>
//             </div>
//           </div>
//           <StatusBadge status={ticket.status} />
//         </div>
//       </div>

//       {/* Card Body */}
//       <div className="px-6 py-5">
//         <div className="space-y-4">
//           {/* Employee Info */}
//           <div className="flex items-start space-x-3">
//             <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
//               <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
//               </svg>
//             </div>
//             <div className="flex-1 min-w-0">
//               <p className="text-sm font-semibold text-slate-800">{ticket.name}</p>
//               <p className="text-xs text-slate-500">ID: {ticket.empId}</p>
//             </div>
//           </div>

//           {/* Location */}
//           <div className="flex items-start space-x-3">
//             <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
//               <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
//               </svg>
//             </div>
//             <div className="flex-1 min-w-0">
//               <p className="text-sm font-medium text-slate-700">{ticket.location}</p>
//             </div>
//           </div>

//           {/* Issue Description */}
//           <div className="flex items-start space-x-3">
//             <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
//               <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
//               </svg>
//             </div>
//             <div className="flex-1 min-w-0">
//               <p className="text-sm text-slate-700 leading-relaxed">
//                 {truncateText(ticket.issueDesc)}
//               </p>
//             </div>
//           </div>

//           {/* Priority (if available) */}
//           {ticket.priority && (
//             <div className="flex items-center justify-between">
//               <span className="text-xs font-medium text-slate-600">Priority:</span>
//               <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
//                 {ticket.priority}
//               </span>
//             </div>
//           )}

//           {/* Assignment Info */}
//           {ticket.assignedTo && (
//             <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
//               <div className="flex items-center space-x-2">
//                 <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
//                 </svg>
//                 <div>
//                   <p className="text-xs font-medium text-slate-600">Assigned to:</p>
//                   <p className="text-sm font-semibold text-slate-800">{ticket.assignedTo}</p>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Card Actions */}
//       {showActions && (
//         <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
//           <div className="flex flex-col sm:flex-row gap-2">
//             {onView && (
//               <button
//                 onClick={() => onView(ticket)}
//                 className="flex-1 flex items-center justify-center px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border-2 border-slate-200 hover:border-slate-300 rounded-lg transition-all duration-200 font-medium text-sm"
//               >
//                 <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
//                 </svg>
//                 View Details
//               </button>
//             )}
//             {onAssign && ticket.status === 'Open' && (
//               <button
//                 onClick={() => onAssign(ticket)}
//                 className="flex-1 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white rounded-lg transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
//               >
//                 <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
//                 </svg>
//                 Assign Ticket
//               </button>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TicketCard;