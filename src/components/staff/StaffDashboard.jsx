import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../../api/firebase';
import StatusBadge from '../shared/StatusBadge';

const StaffDashboard = ({ currentUser }) => {
  const [assignedTickets, setAssignedTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [resolution, setResolution] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9); // 9 tickets per page (3x3 grid)
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    resolved: 0,
    inProgress: 0,
  });

  useEffect(() => {
    fetchAssignedTickets();
  }, [currentUser]);

  useEffect(() => {
    calculateStats();
  }, [assignedTickets]);

  const fetchAssignedTickets = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      console.log('Looking for assigned_to:', currentUser.username);
      const q = query(
        collection(db, 'tickets'),
        where('assigned_to', '==', currentUser.username),
        where('status', 'in', ['Assigned', 'In Progress', 'Resolved']),
        orderBy('created_date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const tickets = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ticketId: data.ticket_id,
          name: data.name,
          empId: data.emp_id,
          location: data.location,
          issueDesc: data.issue_desc,
          status: data.status || 'Assigned',
          assignedTo: data.assigned_to || null,
          priority: data.priority || 'medium',
          attachments: data.attachments || [],
          createdAt: data.created_date?.toDate() || new Date(),
          assignedDate: data.assigned_date?.toDate() || data.created_date?.toDate() || new Date(), // Fallback to created_date
          updatedAt: data.updated_date?.toDate() || null,
          resolution: data.resolution || '',
          resolutionDate: data.resolution_date?.toDate() || null,
          resolvedBy: data.resolved_by || null,
        };

      });
      console.log('Fetched tickets:', tickets);
      setAssignedTickets(tickets);
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
      total: assignedTickets.length,
      open: assignedTickets.filter(t => t.status === 'Assigned').length,
      resolved: assignedTickets.filter(t => t.status === 'Resolved').length,
      inProgress: assignedTickets.filter(t => t.status === 'In Progress').length,
    };
    setStats(newStats);
  };

  const handleTicketAction = (ticket, action) => {
    if (action === 'resolve' || action === 'view') {
      setSelectedTicket(ticket);
      setResolution(action === 'view' ? ticket.resolution || '' : '');
    } else if (action === 'start') {
      updateTicketStatus(ticket.id, 'In Progress');
    }
  };

  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      const ticketRef = doc(db, 'tickets', ticketId);
      await updateDoc(ticketRef, {
        status: newStatus,
        updatedAt: new Date(),
      });
      await fetchAssignedTickets(true);
    } catch (error) {
      console.error('Error updating ticket status:', error);
      setError('Failed to update ticket status. Please try again.');
    }
  };

  const resolveTicket = async () => {
    if (!resolution.trim() || !selectedTicket) return;

    setResolving(true);
    try {
      const ticketRef = doc(db, 'tickets', selectedTicket.id);
      await updateDoc(ticketRef, {
        status: 'Resolved',
        resolution: resolution.trim(),
        resolutionDate: new Date(),
        updatedAt: new Date(),
      });
      setSelectedTicket(null);
      setResolution('');
      await fetchAssignedTickets(true);
    } catch (error) {
      console.error('Error resolving ticket:', error);
      setError('Failed to resolve ticket. Please try again.');
    } finally {
      setResolving(false);
    }
  };

  const closeModal = () => {
    setSelectedTicket(null);
    setResolution('');
  };

  const getStatIcon = (type) => {
    const icons = {
      total: 'M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V9a2 2 0 00-2-2h-2m-1-4h-1m0 0H9m1 0v1M9 7h1m-1 0h1m-1 0v8a2 2 0 002 2M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2h-4z',
      open: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      resolved: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      inProgress: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    };
    return icons[type] || icons.total;
  };

  const getStatColor = (type) => {
    const colors = {
      total: 'text-slate-600 bg-slate-100',
      open: 'text-blue-600 bg-blue-100',
      resolved: 'text-green-600 bg-green-100',
      inProgress: 'text-purple-600 bg-purple-100',
    };
    return colors[type] || colors.total;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTickets = assignedTickets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(assignedTickets.length / itemsPerPage);

  // Generate page numbers array
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);

      if (startPage > 1) {
        pageNumbers.push(1);
        if (startPage > 2) {
          pageNumbers.push('...');
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

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
    document.querySelector('.tickets-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
            <p className="text-slate-600 font-medium">Loading your assigned tickets...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-6 lg:px-6">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white">My Assigned Tickets</h1>
                  <p className="text-slate-200 mt-1">Welcome back, {currentUser?.name || currentUser?.username}</p>
                </div>
                <button
                  onClick={() => fetchAssignedTickets(true)}
                  disabled={refreshing}
                  className="flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 backdrop-blur border border-white/20 disabled:opacity-50"
                >
                  <svg
                    className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
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
            <div
              key={key}
              className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl lg:text-3xl font-bold text-slate-800">{value}</p>
                  <p className="text-sm text-slate-600 capitalize font-medium mt-1">
                    {key === 'total' ? 'Total' : key === 'inProgress' ? 'In Progress' : key}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${getStatColor(key)}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={getStatIcon(key)} />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tickets Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-700">
                Your Assigned Tickets ({assignedTickets.length})
              </h3>
              {assignedTickets.length > 0 && (
                <span className="text-sm text-slate-500">
                  {stats.open} open • {stats.inProgress} in progress • {stats.resolved} resolved
                </span>
              )}
            </div>
          </div>

          <div className="p-6">
            {assignedTickets.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-slate-600 mb-2">All caught up!</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  You don't have any tickets assigned to you at the moment. Great job staying on top of your work!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {currentTickets.map(ticket => (
                  <StaffTicketCard key={ticket.id} ticket={ticket} onAction={handleTicketAction} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Resolution Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4">
                <h3 className="text-xl font-bold text-white">
                  {selectedTicket.status === 'Resolved' ? 'View Resolved Ticket' : 'Resolve Ticket'}
                </h3>
                <p className="text-slate-200 text-sm mt-1">#{selectedTicket.ticketId}</p>
              </div>

              <div className="p-6">
                {/* Ticket Summary */}
                <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Employee:</p>
                      <p className="text-slate-800 font-semibold">{selectedTicket.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">Location:</p>
                      <p className="text-slate-800 font-semibold">{selectedTicket.location}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">Priority:</p>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${selectedTicket.priority === 'high'
                            ? 'text-red-600 bg-red-100'
                            : selectedTicket.priority === 'medium'
                              ? 'text-amber-600 bg-amber-100'
                              : 'text-green-600 bg-green-100'
                          }`}
                      >
                        {selectedTicket.priority} priority
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">Assigned Date:</p>
                      <p className="text-slate-800 font-semibold">{formatDate(selectedTicket.assignedDate)}</p>
                    </div>
                    {selectedTicket.status === 'Resolved' && selectedTicket.resolutionDate && (
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium text-slate-600">Resolution Date:</p>
                        <p className="text-slate-800 font-semibold">{formatDate(selectedTicket.resolutionDate)}</p>
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-slate-600 mb-2">Issue Description:</p>
                      <p className="text-slate-800 bg-white rounded p-3 border border-slate-200">
                        {selectedTicket.issueDesc}
                      </p>
                    </div>
                    {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium text-slate-600 mb-2">Attachments:</p>
                        <AttachmentPreview attachments={selectedTicket.attachments} />
                      </div>
                    )}
                  </div>
                  {assignedTickets.length > itemsPerPage && (
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-sm text-slate-600">
                        Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, assignedTickets.length)} of {assignedTickets.length} tickets
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          Previous
                        </button>

                        <div className="flex items-center space-x-1">
                          {getPageNumbers().map((pageNum, index) => (
                            <button
                              key={index}
                              onClick={() => typeof pageNum === 'number' && handlePageChange(pageNum)}
                              disabled={pageNum === '...'}
                              className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${pageNum === currentPage
                                  ? 'bg-slate-600 text-white shadow-lg'
                                  : pageNum === '...'
                                    ? 'text-slate-400 cursor-default'
                                    : 'text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 hover:text-slate-700'
                                }`}
                            >
                              {pageNum}
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          Next
                        </button>
                      </div>

                      <div className="text-sm text-slate-600">
                        Page {currentPage} of {totalPages}
                      </div>
                    </div>
                  )}
                </div>

                {/* Resolution Form */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3 text-slate-700">
                    Resolution Notes {selectedTicket.status !== 'Resolved' && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    value={resolution}
                    onChange={e => selectedTicket.status !== 'Resolved' && setResolution(e.target.value)}
                    placeholder={
                      selectedTicket.status === 'Resolved'
                        ? 'No resolution notes available'
                        : 'Describe how you resolved this issue. Include any steps taken, parts replaced, or configuration changes made...'
                    }
                    rows="6"
                    className={`w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-4 focus:ring-slate-500/20 focus:border-slate-500 transition-all duration-200 bg-slate-50 focus:bg-white resize-none ${selectedTicket.status === 'Resolved' ? 'cursor-not-allowed opacity-75' : ''
                      }`}
                    disabled={resolving || selectedTicket.status === 'Resolved'}
                    readOnly={selectedTicket.status === 'Resolved'}
                  />
                  {selectedTicket.status !== 'Resolved' && (
                    <p className="text-xs text-slate-500 mt-2">{resolution.length}/500 characters</p>
                  )}
                </div>

                {/* Modal Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {selectedTicket.status !== 'Resolved' ? (
                    <button
                      onClick={resolveTicket}
                      disabled={!resolution.trim() || resolving}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-4 rounded-lg disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                    >
                      {resolving ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Resolving...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Mark as Resolved
                        </span>
                      )}
                    </button>
                  ) : null}
                  <button
                    onClick={closeModal}
                    disabled={resolving}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-4 rounded-lg transition-all duration-200 font-semibold border-2 border-slate-200 hover:border-slate-300 disabled:opacity-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AttachmentPreview = ({ attachments }) => {
  if (!attachments || attachments.length === 0) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
          />
        </svg>
        <span className="text-sm">No attachments available</span>
      </div>
    );
  }

  const getAttachmentIcon = (type) => {
    switch (type) {
      case 'image':
        return (
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        );
      case 'video':
        return (
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        );
    }
  };

  const getCloudinaryThumbnail = (url, type) => {
    if (!url) return null;
    if (type === 'image') {
      return url.replace('/upload/', '/upload/w_150,h_100,c_fill,q_auto,f_auto/');
    } else if (type === 'video') {
      return url.replace('/upload/', '/upload/w_150,h_100,c_fill,so_0/').replace('.mp4', '.jpg');
    }
    return null;
  };

  return (
    <div className="flex flex-wrap gap-2">
      {attachments.slice(0, 3).map((attachment, index) => {
        const thumbnailUrl = getCloudinaryThumbnail(attachment.url, attachment.type);
        console.log('Attachment:', attachment); // Debug attachment data
        return (
          <a
            key={attachment.id || `attachment-${index}`} // Unique key with fallback
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="relative group cursor-pointer"
          >
            {thumbnailUrl ? (
              <div className="relative w-16 h-12 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-600 transition-all duration-200">
                <img
                  src={thumbnailUrl}
                  alt={attachment.name || 'Attachment'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-200"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden w-full h-full bg-gray-100 flex items-center justify-center">
                  {getAttachmentIcon(attachment.type)}
                </div>
                {attachment.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black bg-opacity-60 rounded-full w-6 h-6 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-16 h-12 bg-gray-100 rounded-lg border-2 border-gray-200 hover:border-blue-600 transition-all duration-200 flex items-center justify-center">
                {getAttachmentIcon(attachment.type)}
              </div>
            )}
          </a>
        );
      })}
      {attachments.length > 3 && (
        <div className="w-16 h-12 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
          +{attachments.length - 3}
        </div>
      )}
    </div>
  );
};

const StaffTicketCard = ({ ticket, onAction }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const truncateText = (text, maxLength = 120) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'text-red-600 bg-red-100',
      medium: 'text-amber-600 bg-amber-100',
      low: 'text-green-600 bg-green-100',
    };
    return colors[priority] || colors.medium;
  };

  // const getUrgencyLevel = (createdAt) => {
  //   if (!createdAt) return 'medium';
  //   const now = new Date();
  //   const created = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
  //   const hoursDiff = (now - created) / (1000 * 60 * 60);
  //   if (hoursDiff > 48) return 'high';
  //   if (hoursDiff > 24) return 'medium';
  //   return 'low';
  // };

  // const getUrgencyColor = (urgency) => {
  //   const colors = {
  //     high: 'text-red-600 bg-red-100',
  //     medium: 'text-amber-600 bg-amber-100',
  //     low: 'text-green-600 bg-green-100',
  //   };
  //   return colors[urgency] || colors.medium;
  // };

  // const urgency = getUrgencyLevel(ticket.createdAt);

  return (
    <div
      className={`bg-white rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden ${ticket.status === 'Resolved' ? 'bg-green-50/50' : ''
        }`}
    >
      {/* Card Header */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${ticket.status === 'Resolved'
                  ? 'bg-gradient-to-r from-green-600 to-green-700'
                  : 'bg-gradient-to-r from-slate-600 to-slate-700'
                }`}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {ticket.status === 'Resolved' ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                  />
                )}
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">#{ticket.ticketId}</h3>
              <p className="text-sm text-slate-500">{formatDate(ticket.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative group">
              <StatusBadge status={ticket.status} size="sm" />
              <div className="absolute hidden group-hover:block bg-slate-800 text-white text-xs rounded py-1 px-2 -mt-8">
                {ticket.status} Status
              </div>
            </div>
            <div className="relative group">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                  ticket.priority
                )}`}
              >
                {ticket.priority} priority
              </span>
              <div className="absolute hidden group-hover:block bg-slate-800 text-white text-xs rounded py-1 px-2 -mt-8">
                Priority: {ticket.priority}
              </div>
            </div>
            {/* <div className="relative group">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(
                  urgency
                )}`}
              >
                {urgency} urgency
              </span>
              <div className="absolute hidden group-hover:block bg-slate-800 text-white text-xs rounded py-1 px-2 -mt-8">
                Urgency based on ticket age
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="px-6 py-5">
        <div className="space-y-3">
          {/* Employee Info */}
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800">{ticket.name}</p>
              <p className="text-xs text-slate-500">ID: {ticket.empId}</p>
            </div>
          </div>

          {/* Location and Assigned Date */}
          <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-3 sm:space-y-0">
            <div className="flex items-start space-x-3 flex-1">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700">{ticket.location}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 flex-1">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700">Assigned: {formatDate(ticket.assignedDate)}</p>
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <AttachmentPreview attachments={ticket.attachments} />
            </div>
          </div>

          {/* Issue Description */}
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-700 leading-relaxed">
                {isExpanded ? ticket.issueDesc : truncateText(ticket.issueDesc)}
              </p>
              {ticket.issueDesc && ticket.issueDesc.length > 120 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs text-slate-500 hover:text-slate-700 mt-1"
                >
                  {isExpanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          </div>

          {/* Resolution Info for Resolved Tickets */}
          {ticket.status === 'Resolved' && ticket.resolution && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-green-700 leading-relaxed font-medium">
                  Resolved: {isExpanded ? ticket.resolution : truncateText(ticket.resolution)}
                </p>
                <p className="text-xs text-green-600 mt-1">{formatDate(ticket.resolutionDate)}</p>
                {ticket.resolution && ticket.resolution.length > 120 && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs text-slate-500 hover:text-slate-700 mt-1"
                  >
                    {isExpanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Actions */}
      <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row gap-2">
          {ticket.status === 'Assigned' && (
            <button
              onClick={() => onAction(ticket, 'start')}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Start Working
            </button>
          )}
          <button
            onClick={() => onAction(ticket, ticket.status === 'Resolved' ? 'view' : 'resolve')}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={
                  ticket.status === 'Resolved'
                    ? 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM7 6v12a2 2 0 002 2h6a2 2 0 002-2V6m-4 0v12'
                    : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                }
              />
            </svg>
            {ticket.status === 'Resolved' ? 'View Details' : 'Resolve Ticket'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;