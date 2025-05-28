export const LOCATIONS = [
  'MSPL',
  'MPPL', 
  'MFPL',
  'Capital-A'
];

export const IT_STAFF = [
  'raghu',
  'manoj'
];

export const TICKET_STATUS = {
  OPEN: 'Open',
  ASSIGNED: 'Assigned', 
  RESOLVED: 'Resolved',
  REOPENED: 'Reopened',
  CLOSED: 'Closed'
};

export const USER_ROLES = {
  MANAGER: 'manager',
  STAFF: 'staff'
};

// utils/constants.js
export const DEFAULT_USERS = [
  {
    id: 1,
    username: 'staff-a',
    password: 'staff123',
    role: 'staff',
    name: 'System Administrator'
  },
  {
    id: 2,
    username: 'manager',
    password: 'manager123',
    role: 'manager',
    name: 'IT Manager'
  },
  {
    id: 3,
    username: 'staff-b',
    password: 'staff123',
    role: 'staff',
    name: 'IT Staff'
  }
];