import React, { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../api/firebase';
import { Search, RefreshCw, AlertCircle, CheckCircle, Clock, User, MapPin, Calendar, Star, FileText } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    'OPEN': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock, text: 'Open' },
    'IN_PROGRESS': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: RefreshCw, text: 'In Progress' },
    'RESOLVED': { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, text: 'Resolved' },
    'CLOSED': { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: CheckCircle, text: 'Closed' }
  };
  
  const config = statusConfig[status] || statusConfig['OPEN'];
  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${config.color}`}>
      <Icon size={14} />
      {config.text}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const priorityConfig = {
    'Low': 'bg-gray-100 text-gray-700 border-gray-200',
    'Normal': 'bg-blue-100 text-blue-700 border-blue-200',
    'High': 'bg-orange-100 text-orange-700 border-orange-200',
    'Critical': 'bg-red-100 text-red-700 border-red-200'
  };
  
  const colorClass = priorityConfig[priority] || priorityConfig['Normal'];
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
      {priority || 'Normal'}
    </span>
  );
};

const StarRating = ({ rating }) => {
  if (!rating) return null;
  
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star 
          key={i} 
          size={16} 
          className={i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} 
        />
      ))}
      <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
    </div>
  );
};

const InfoCard = ({ icon, label, value }) => (
  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
    <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
      {icon}
      <span>{label}</span>
    </div>
    <div className="font-medium text-gray-900">
      {value}
    </div>
  </div>
);

const SectionCard = ({ title, children, note = null, color = 'gray' }) => {
  const colorConfig = {
    gray: 'border-gray-200 bg-gray-50',
    green: 'border-green-200 bg-green-50',
    yellow: 'border-yellow-200 bg-yellow-50'
  };

  return (
    <div className={`border rounded-lg p-6 ${colorConfig[color]}`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-800">{title}</h4>
        {note && <span className="text-sm text-gray-600">{note}</span>}
      </div>
      {children}
    </div>
  );
};

const CheckTicket = () => {
  const [empId, setEmpId] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const resetForm = () => {
    setTicket(null);
    setError('');
    setSearched(false);
    setEmpId('');
    setTicketId('');
  };

  const validateInputs = () => {
    if (!empId.trim()) {
      setError('Employee ID is required');
      return false;
    }
    if (!ticketId.trim()) {
      setError('Ticket ID is required');
      return false;
    }
    if (!/^IT\d{4}-\d{4}$/.test(ticketId.trim())) {
      setError('Invalid ticket ID format. Expected format: IT2025-0012');
      return false;
    }
    return true;
  };

  const searchTicket = async () => {
    if (!validateInputs()) {
      return;
    }

    setLoading(true);
    setError('');
    setTicket(null);
    
    try {
      // Query Firebase for the ticket
      const q = query(
        collection(db, 'tickets'), 
        where('emp_id', '==', empId.trim()),
        where('ticket_id', '==', ticketId.trim())
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const ticketDoc = querySnapshot.docs[0];
        const ticketData = { id: ticketDoc.id, ...ticketDoc.data() };
        setTicket(ticketData);
      } else {
        setError('Ticket not found. Please verify your Employee ID and Ticket ID.');
      }
    } catch (error) {
      console.error('Error searching ticket:', error);
      setError('Unable to search for ticket. Please try again later.');
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      // Handle Firebase Timestamp
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <div className="bg-white shadow-2xl border border-slate-200 rounded-2xl overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-700 to-slate-600 p-8 text-center text-white">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 flex items-center justify-center bg-white/20 rounded-full mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Check Ticket Status</h1>
              <p className="text-slate-200 max-w-md">
                Enter your Employee ID and Ticket ID to track your IT support request.
              </p>
            </div>
          </div>

          {/* Search Form */}
          <div className="p-6 md:p-8 bg-white">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Employee ID */}
                <div>
                  <label htmlFor="empId" className="block text-sm font-semibold text-gray-700 mb-1">
                    Employee ID *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="empId"
                      type="text"
                      value={empId}
                      onChange={handleInputChange(setEmpId)}
                      placeholder="e.g., EMP001"
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-slate-500 focus:outline-none transition ${
                        error && !empId.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Ticket ID */}
                <div>
                  <label htmlFor="ticketId" className="block text-sm font-semibold text-gray-700 mb-1">
                    Ticket ID *
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="ticketId"
                      type="text"
                      value={ticketId}
                      onChange={handleInputChange(setTicketId)}
                      placeholder="e.g., IT2025-0012"
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-slate-500 focus:outline-none transition ${
                        error && !ticketId.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={searchTicket}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold py-3 px-6 rounded-lg transition hover:scale-105 disabled:hover:scale-100"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Check Ticket Status
                    </>
                  )}
                </button>

                {(ticket || searched) && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition"
                  >
                    <RefreshCw className="w-5 h-5" />
                    New Search
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Ticket Not Found */}
          {searched && !ticket && !loading && !error && (
            <div className="bg-gray-50 border-t px-6 py-10 text-center">
              <Search className="w-10 h-10 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-1">No Ticket Found</h3>
              <p className="text-gray-600">Please verify your Employee ID and Ticket ID and try again.</p>
            </div>
          )}

          {/* Ticket Result Display */}
          {ticket && (
            <div className="bg-white border-t px-6 py-8 space-y-6">
              {/* Ticket Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Ticket Details</h3>
                  <p className="text-gray-500 font-mono">{ticket.ticket_id}</p>
                </div>
                <StatusBadge status={ticket.status} />
              </div>

              {/* Grid Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InfoCard 
                  icon={<User className="w-4 h-4" />} 
                  label="Employee" 
                  value={`${ticket.name} (${ticket.emp_id})`} 
                />
                <InfoCard 
                  icon={<MapPin className="w-4 h-4" />} 
                  label="Location" 
                  value={ticket.location} 
                />
                <InfoCard 
                  icon={<Calendar className="w-4 h-4" />} 
                  label="Created Date" 
                  value={formatDate(ticket.created_date)} 
                />
                {ticket.assigned_to && (
                  <InfoCard 
                    icon={<User className="w-4 h-4" />} 
                    label="Assigned To" 
                    value={ticket.assigned_to} 
                  />
                )}
                {ticket.updated_date && (
                  <InfoCard 
                    icon={<Clock className="w-4 h-4" />} 
                    label="Last Updated" 
                    value={formatDate(ticket.updated_date)} 
                  />
                )}
                <InfoCard 
                  icon={<AlertCircle className="w-4 h-4" />} 
                  label="Status" 
                  value={<StatusBadge status={ticket.status} />} 
                />
              </div>

              {/* Issue Description */}
              <SectionCard title="Issue Description">
                <p className="text-gray-700 leading-relaxed">{ticket.issue_desc}</p>
              </SectionCard>

              {/* Attachments */}
              {ticket.attachments && ticket.attachments.length > 0 && (
                <SectionCard title="Attachments">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ticket.attachments.map((file, index) => (
                      <div key={index} className="flex items-center space-x-3 bg-white p-3 rounded-lg border">
                        <img 
                          src={file.url} 
                          alt={file.original_filename}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <span className="text-sm text-gray-700 truncate">
                          {file.original_filename}
                        </span>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}

              {/* Resolution */}
              {ticket.resolution && (
                <SectionCard 
                  title="Resolution Details" 
                  note={ticket.resolution_date ? `Resolved on ${formatDate(ticket.resolution_date)}` : null} 
                  color="green"
                >
                  <p className="text-gray-700 leading-relaxed">{ticket.resolution}</p>
                </SectionCard>
              )}

              {/* Feedback */}
              {ticket.user_feedback && (
                <SectionCard title="Your Feedback" color="yellow">
                  <p className="text-gray-700 leading-relaxed">{ticket.user_feedback}</p>
                  {ticket.feedback_flag && (
                    <div className="mt-2 text-sm text-green-600">
                      ✓ Feedback submitted
                    </div>
                  )}
                </SectionCard>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckTicket;