export const generateTicketId = () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `IT${year}-${randomNum}`;
};

export const formatDate = (date) => {
  if (!date) return 'N/A';
  if (date.toDate) {
    return date.toDate().toLocaleDateString();
  }
  return new Date(date).toLocaleDateString();
};

export const getStatusColor = (status) => {
  const colors = {
    'Open': '#ff9800',
    'Assigned': '#2196f3',
    'Resolved': '#4caf50',
    'Reopened': '#f44336',
    'Closed': '#9e9e9e'
  };
  return colors[status] || '#757575';
};

export const validateTicketForm = (formData) => {
  const errors = {};
  
  if (!formData.name?.trim()) {
    errors.name = 'Name is required';
  }
  
  if (!formData.empId?.trim()) {
    errors.empId = 'Employee ID is required';
  }
  
  if (!formData.location?.trim()) {
    errors.location = 'Location is required';
  }
  
  if (!formData.issueDesc?.trim()) {
    errors.issueDesc = 'Issue description is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
