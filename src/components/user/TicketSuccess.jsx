// components/user/TicketSuccess.jsx
import React from 'react';

const TicketSuccess = ({ ticketId, onNewTicket, onCheckTicket }) => {
  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md border text-center">
      <div className="mb-6">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Ticket Submitted Successfully!
        </h2>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-600 mb-2">Your ticket ID is:</p>
          <p className="text-2xl font-bold text-blue-600 font-mono">{ticketId}</p>
        </div>
        
        <p className="text-sm text-gray-500 mb-6">
          Please save this ID for future reference. You can use it to check your ticket status.
        </p>
      </div>
      
      <div className="space-y-3">
        <button
          onClick={onNewTicket}
          className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 transition-colors duration-200 font-medium flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
          </svg>
          🔁 Raise New Ticket
        </button>
        
        <button
          onClick={onCheckTicket}
          className="w-full bg-gray-500 text-white p-3 rounded-md hover:bg-gray-600 transition-colors duration-200 font-medium flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          📄 Check My Ticket
        </button>
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-400">
          Our IT team will review your ticket and
           {/* assign it to the appropriate technician. */}
          you will be notified of any updates.
        </p>
      </div>
    </div>
  );
};

export default TicketSuccess;