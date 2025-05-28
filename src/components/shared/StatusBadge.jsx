import React from 'react';

const StatusBadge = ({ status, size = 'md' }) => {
  const getStatusConfig = (status) => {
    const configs = {
      'Open': {
        color: 'bg-amber-100 text-amber-800 border-amber-200',
        icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z',
        dot: 'bg-amber-400'
      },
      'Assigned': {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
        dot: 'bg-blue-400'
      },
      'In Progress': {
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
        dot: 'bg-purple-400'
      },
      'Resolved': {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        dot: 'bg-green-400'
      },
      'Closed': {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
        dot: 'bg-gray-400'
      },
      'Reopened': {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
        dot: 'bg-red-400'
      },
      'Pending': {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
        dot: 'bg-yellow-400'
      }
    };

    return configs[status] || {
      color: 'bg-slate-100 text-slate-800 border-slate-200',
      icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      dot: 'bg-slate-400'
    };
  };

  const getSizeClasses = (size) => {
    const sizes = {
      'sm': {
        container: 'px-2 py-1 text-xs',
        icon: 'w-3 h-3',
        dot: 'w-2 h-2'
      },
      'md': {
        container: 'px-2.5 py-1 text-xs',
        icon: 'w-3.5 h-3.5',
        dot: 'w-2.5 h-2.5'
      },
      'lg': {
        container: 'px-3 py-1.5 text-sm',
        icon: 'w-4 h-4',
        dot: 'w-3 h-3'
      }
    };

    return sizes[size] || sizes.md;
  };

  const config = getStatusConfig(status);
  const sizeClasses = getSizeClasses(size);

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${config.color} ${sizeClasses.container} transition-all duration-200`}>
      <span className={`rounded-full ${config.dot} ${sizeClasses.dot} animate-pulse`}></span>
      <span className="capitalize">{status}</span>
      <svg className={`${sizeClasses.icon} opacity-70`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={config.icon}></path>
      </svg>
    </span>
  );
};

export default StatusBadge;