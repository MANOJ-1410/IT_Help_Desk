import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock, User, MapPin, FileText, Users, CheckCircle, RotateCcw, ExternalLink, Paperclip, Eye } from 'lucide-react';
import { collection, getDocs, doc, updateDoc, orderBy, query } from 'firebase/firestore';
import { db } from '../../api/firebase';

// Constants matching your SubmitTicket component
const LOCATIONS = ['MSPL', 'MFPL', 'Capital-A', 'MPPL'];
const IT_STAFF = ['staff-a', 'staff-b'];
const PRIORITIES = ['Low', 'Medium', 'High'];

// TicketCard Component
const TicketCard = ({ ticket, showActions = true, onAssign }) => {
  const getStatusColor = (status) => {
    const colors = {
      'OPEN': 'bg-amber-100 text-amber-800 border-amber-200',
      'Assigned': 'bg-blue-100 text-blue-800 border-blue-200',
      'Resolved': 'bg-green-100 text-green-800 border-green-200',
      // 'Reopened': 'bg-red-100 text-red-800 border-red-200',
      'Closed': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || colors['OPEN'];
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'OPEN': return <AlertCircle className="w-4 h-4" />;
      case 'Assigned': return <User className="w-4 h-4" />;
      case 'Resolved': return <CheckCircle className="w-4 h-4" />;
      // case 'Reopened': return <RotateCcw className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleAttachmentClick = (attachment) => {
    // For Cloudinary URLs, open directly
    if (attachment.url) {
      window.open(attachment.url, '_blank');
    }
  };
  const getFileIcon = (fileName, url) => {
    if (!fileName || typeof fileName !== 'string') {
      return '📎';
    }
    const extension = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
      return '🖼️';
    } else if (['pdf'].includes(extension)) {
      return '📄';
    } else if (['doc', 'docx'].includes(extension)) {
      return '📝';
    } else if (['xls', 'xlsx'].includes(extension)) {
      return '📊';
    } else if (['txt'].includes(extension)) {
      return '📋';
    }
    return '📎';
  };

  // Add this function after getStatusColor
  const getPriorityColor = (priority) => {
    const colors = {
      'Low': 'bg-blue-100 text-blue-700 border-blue-200',
      'Medium': 'bg-orange-100 text-orange-700 border-orange-200',
      'High': 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[priority] || colors['Medium'];
  };


  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-200 overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">#{ticket.ticket_id}</h3>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(ticket.status)}`}>
                {getStatusIcon(ticket.status)}
                <span className="ml-1">{ticket.status}</span>
              </span>
              {ticket.priority && (
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority}
                </span>
              )}

            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Created</p>
            <p className="text-sm font-medium text-slate-700">{formatDate(ticket.created_date)}</p>
          </div>
        </div>

        {/* Employee Info */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">{ticket.name}</span>
            <span className="text-sm text-slate-500">({ticket.emp_id})</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-600">{ticket.location}</span>
          </div>
        </div>

        {/* Issue Description */}
        <div className="mb-4">
          <div className="flex items-start space-x-2">
            <FileText className="w-4 h-4 text-slate-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-slate-600 line-clamp-3">{ticket.issue_desc}</p>
            </div>
          </div>
        </div>

        {/* Attachments */}
        {ticket.attachments && ticket.attachments.length > 0 && (
          <div className="mb-4">
            <div className="flex items-start space-x-2">
              <Paperclip className="w-4 h-4 text-slate-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-700 mb-2">Attachments ({ticket.attachments.length})</p>
                <div className="space-y-2">
                  {ticket.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-slate-50 rounded-lg p-2 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                      onClick={() => handleAttachmentClick(attachment)}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getFileIcon(attachment.name, attachment.url)}</span>
                        <div>
                          <p className="text-sm font-medium text-slate-700 truncate max-w-[200px]">{attachment.name}</p>
                          {attachment.size && (
                            <p className="text-xs text-slate-500">{(attachment.size / 1024).toFixed(1)} KB</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          className="p-1 hover:bg-slate-200 rounded transition-colors"
                          title="View attachment"
                        >
                          <Eye className="w-4 h-4 text-slate-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resolution Info - Add this new section */}
        {ticket.status === 'Resolved' && ticket.resolution && (
          <div className="mb-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800 mb-1">Resolution Notes</p>
                  <p className="text-sm text-green-700">{ticket.resolution}</p>
                </div>
              </div>
              {ticket.resolutionDate && (
                <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-green-200">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">
                    Resolved on: {formatDate(ticket.resolutionDate)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Assignment Info */}
        {ticket.assigned_to && (
          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-600">Assigned to:</span>
              <span className="text-sm font-medium text-slate-700">{ticket.assigned_to}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="pt-4 border-t border-slate-200">
            <div className="flex space-x-2">
              {ticket.status === 'OPEN' && (
                <button
                  onClick={() => onAssign && onAssign(ticket)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium flex items-center justify-center"
                >
                  <User className="w-4 h-4 mr-1" />
                  Assign
                </button>
              )}
              {/* <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium flex items-center justify-center">
                <ExternalLink className="w-4 h-4 mr-1" />
                View Details
              </button> */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ManagerDashboard = ({ currentUser = { name: 'Manager' } }) => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    location: '',
    assigned_to: ''
  });
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('')
  const [assigning, setAssigning] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    assigned: 0,
    resolved: 0,
    reopened: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllTickets();
  }, []);

  useEffect(() => {
    applyFilters();
    calculateStats();
  }, [tickets, filters]);

  const fetchAllTickets = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      // Create a query to get all tickets, ordered by creation date (newest first)
      const ticketsCollection = collection(db, 'tickets');
      const ticketsQuery = query(ticketsCollection, orderBy('created_date', 'desc'));
      const ticketsSnapshot = await getDocs(ticketsQuery);

      // Transform the Firebase documents into the format expected by your component
      const ticketsData = ticketsSnapshot.docs.map(doc => {
        const data = doc.data();

        return {
          id: doc.id,
          ticket_id: data.ticket_id,
          name: data.name,
          emp_id: data.emp_id,
          location: data.location,
          issue_desc: data.issue_desc,
          status: data.status || 'OPEN',
          assigned_to: data.assigned_to || null,
          priority: data.priority || null,
          attachments: data.attachments || [],
          created_date: data.created_date?.toDate() || new Date(),
          updated_date: data.updated_date?.toDate() || null,
          // Add these new fields
          resolution: data.resolution || null,
          resolutionDate: data.resolutionDate?.toDate() || null,
          resolved_by: data.resolved_by || null
        };
      });

      setTickets(ticketsData);
      console.log(`Loaded ${ticketsData.length} tickets`);

    } catch (error) {
      console.error('Error fetching tickets:', error);
      setError('Failed to load tickets. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateStats = () => {
    const newStats = {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'OPEN').length,
      assigned: tickets.filter(t => t.status === 'Assigned').length,
      resolved: tickets.filter(t => t.status === 'Resolved').length,
      // reopened: tickets.filter(t => t.status === 'Reopened').length
    };
    setStats(newStats);
  };

  const handleAssignTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowAssignModal(true);
    setSelectedPriority('');
    setShowAssignModal(true);
  };

  const confirmAssignment = async () => {
    if (!selectedStaff || !selectedTicket) return;

    setAssigning(true);
    try {
      // Update the ticket document in Firebase
      const ticketRef = doc(db, 'tickets', selectedTicket.id);
      await updateDoc(ticketRef, {
        assigned_to: selectedStaff,
        priority: selectedPriority,
        status: 'Assigned',
        updated_date: new Date(),
        assignedBy: currentUser.displayName 
      });

    //   const emailResult = await sendAssignmentNotification(
    //   ticketData, // your ticket object
    //   assigneeEmail,
    //   assigneeName,
    //   currentUser.displayName // manager name
    // );

    // if (emailResult.success) {
    //   console.log('Assignee notified successfully');
    //   // Show success message to manager
    // }
    
      // Update the ticket in the local state to reflect changes immediately
      const updatedTickets = tickets.map(ticket =>
        ticket.id === selectedTicket.id
          ? {
            ...ticket,
            assigned_to: selectedStaff,
            priority: selectedPriority,
            status: 'Assigned',
            updated_date: new Date()
          }
          : ticket
      );

      setTickets(updatedTickets);
      setShowAssignModal(false);
      setSelectedTicket(null);
      setSelectedStaff('');
      setSelectedPriority('');

      console.log(`Ticket ${selectedTicket.ticket_id} assigned to ${selectedStaff}`);

    } catch (error) {
      console.error('Error assigning ticket:', error);
      setError('Failed to assign ticket. Please try again.');
    } finally {
      setAssigning(false);
    }
  };

  const clearFilters = () => {
    setFilters({ status: '', location: '', assigned_to: '' });
  };

  const getStatIcon = (type) => {
    const icons = {
      total: "M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V9a2 2 0 00-2-2h-2m-1-4h-1m0 0H9m1 0v1M9 7h1m-1 0h1m-1 0v8a2 2 0 002 2M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2h-4z",
      open: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z",
      assigned: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
      resolved: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      reopened: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    };
    return icons[type] || icons.total;
  };

  const getStatColor = (type) => {
    const colors = {
      total: 'text-slate-600 bg-slate-100',
      open: 'text-amber-600 bg-amber-100',
      assigned: 'text-blue-600 bg-blue-100',
      resolved: 'text-green-600 bg-green-100',
      reopened: 'text-red-600 bg-red-100'
    };
    return colors[type] || colors.total;
  };

// Calculate pagination values
const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentTickets = filteredTickets.slice(indexOfFirstItem, indexOfLastItem);
const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);

// Generate page numbers array
const getPageNumbers = () => {
  const pageNumbers = [];
  const maxVisiblePages = 5;
  
  if (totalPages <= maxVisiblePages) {
    // Show all pages if total pages is small
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    // Show smart pagination
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pageNumbers.push(1);
      if (startPage > 2) {
        pageNumbers.push('...');
      }
    }
    
    // Add visible page range
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      pageNumbers.push(totalPages);
    }
  }
  
  return pageNumbers;
};

const handlePageChange = (pageNumber) => {
  setCurrentPage(pageNumber);
  // Scroll to top of tickets section
  document.querySelector('.tickets-section')?.scrollIntoView({ behavior: 'smooth' });
};

const applyFilters = () => {
    let filtered = tickets;

    if (filters.status) {
      filtered = filtered.filter(ticket => ticket.status === filters.status);
    }

    if (filters.location) {
      filtered = filtered.filter(ticket => ticket.location === filters.location);
    }

    if (filters.assigned_to) {
      filtered = filtered.filter(ticket => ticket.assigned_to === filters.assigned_to);
    }

    setFilteredTickets(filtered);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
            <p className="text-slate-600 font-medium">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-6 lg:px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white">Manager Dashboard</h1>
                  <p className="text-slate-200 mt-1">Welcome back, {currentUser?.name || 'Manager'}</p>
                </div>
                <button
                  onClick={() => fetchAllTickets(true)}
                  disabled={refreshing}
                  className="flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 backdrop-blur border border-white/20 disabled:opacity-50"
                >
                  <svg
                    className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl lg:text-3xl font-bold text-slate-800">{value}</p>
                  <p className="text-sm text-slate-600 capitalize font-medium mt-1">
                    {key === 'total' ? 'Total Tickets' : key}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${getStatColor(key)}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={getStatIcon(key)}></path>
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 mb-8 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-slate-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"></path>
                </svg>
                <h3 className="text-lg font-semibold text-slate-700">Filter Tickets</h3>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center px-3 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                <svg className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
            </div>
          </div>

          <div className={`p-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-4 focus:ring-slate-500/20 focus:border-slate-500 transition-all duration-200 bg-slate-50 focus:bg-white"
                >
                  <option value="">All Status</option>
                  <option value="OPEN">Open</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Resolved">Resolved</option>
                  {/* <option value="Reopened">Reopened</option> */}
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700">Location</label>
                <select
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-4 focus:ring-slate-500/20 focus:border-slate-500 transition-all duration-200 bg-slate-50 focus:bg-white"
                >
                  <option value="">All Locations</option>
                  {LOCATIONS.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700">Assigned To</label>
                <select
                  value={filters.assigned_to}
                  onChange={(e) => setFilters({ ...filters, assigned_to: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-4 focus:ring-slate-500/20 focus:border-slate-500 transition-all duration-200 bg-slate-50 focus:bg-white"
                >
                  <option value="">All Staff</option>
                  {IT_STAFF.map(staff => (
                    <option key={staff} value={staff}>{staff}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all duration-200 font-semibold border-2 border-slate-200 hover:border-slate-300"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Tickets Section */}
<div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden tickets-section">
  <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-slate-700">
        All Tickets ({filteredTickets.length})
      </h3>
      {filteredTickets.length > 0 && (
        <span className="text-sm text-slate-500">
          Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredTickets.length)} of {filteredTickets.length} tickets
        </span>
      )}
    </div>
  </div>

  <div className="p-6">
    {filteredTickets.length === 0 ? (
      <div className="text-center py-12">
        <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V9a2 2 0 00-2-2h-2m-1-4H9m1 0v1M9 7h1m-1 0h1m-1 0v8a2 2 0 002 2M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2h-4z"></path>
        </svg>
        <h3 className="text-lg font-medium text-slate-600 mb-2">No tickets found</h3>
        <p className="text-slate-500">
          {tickets.length === 0
            ? "No tickets have been submitted yet."
            : "No tickets match your current filter criteria."
          }
        </p>
      </div>
    ) : (
      <>
        {/* Tickets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {currentTickets.map(ticket => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              showActions={true}
              onAssign={handleAssignTicket}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-slate-200">
            <div className="text-sm text-slate-600 mb-4 sm:mb-0">
              Page {currentPage} of {totalPages}
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              {/* Page Numbers */}
              {getPageNumbers().map((pageNumber, index) => (
                <button
                  key={index}
                  onClick={() => typeof pageNumber === 'number' ? handlePageChange(pageNumber) : null}
                  disabled={pageNumber === '...'}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    pageNumber === currentPage
                      ? 'bg-slate-800 text-white'
                      : pageNumber === '...'
                      ? 'text-slate-400 cursor-default'
                      : 'text-slate-600 bg-white border border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </>
    )}
  </div>
</div>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4">
              <h3 className="text-xl font-bold text-white">Assign Ticket</h3>
              <p className="text-slate-200 text-sm mt-1">#{selectedTicket?.ticket_id}</p>
            </div>

            <div className="p-6">
              <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-200">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-slate-600">Employee:</span>
                    <span className="text-sm text-slate-800">{selectedTicket?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-slate-600">Location:</span>
                    <span className="text-sm text-slate-800">{selectedTicket?.location}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <p className="text-sm font-medium text-slate-600 mb-1">Issue:</p>
                    <p className="text-sm text-slate-800">{selectedTicket?.issue_desc}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 text-slate-700">
                  Assign to IT Staff <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-4 focus:ring-slate-500/20 focus:border-slate-500 transition-all duration-200 bg-slate-50 focus:bg-white"
                  required
                >
                  <option value="">Select Staff Member</option>
                  {IT_STAFF.map(staff => (
                    <option key={staff} value={staff}>{staff}</option>
                  ))}
                </select>

                {/* Add Priority Selection */}
                <div className="mb-6 mt-6">
                  <label className="block text-sm font-semibold mb-2 text-slate-700">
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-4 focus:ring-slate-500/20 focus:border-slate-500 transition-all duration-200 bg-slate-50 focus:bg-white"
                    required
                  >
                    {PRIORITIES.map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>

                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <button
                      onClick={confirmAssignment}
                      disabled={!selectedStaff || assigning}
                      className="flex-1 bg-gradient-to-r from-slate-700 to-slate-800 text-white py-3 px-4 rounded-lg hover:from-slate-800 hover:to-slate-900 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                    >
                      {assigning ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Assigning...
                        </span>
                      ) : (
                        'Assign Ticket'
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowAssignModal(false);
                        setSelectedTicket(null);
                        setSelectedStaff('');
                      }}
                      disabled={assigning}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-4 rounded-lg transition-all duration-200 font-semibold border-2 border-slate-200 hover:border-slate-300 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
      )}
        </div>

      );
      
};


export default ManagerDashboard;