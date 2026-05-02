// Format date to readable string
export const formatDate = (dateString) => {
  if (!dateString) return 'TBD';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// Format date with time
export const formatDateTime = (dateString) => {
  if (!dateString) return 'TBD';
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format currency (INR)
export const formatCurrency = (amount) => {
  if (!amount) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

// Get tournament status color
export const getStatusColor = (status) => {
  switch (status) {
    case 'upcoming':
      return '#FF9500';
    case 'ongoing':
      return '#00C853';
    case 'completed':
      return '#9E9E9E';
    default:
      return '#FF9500';
  }
};

// Get match status color
export const getMatchStatusColor = (status) => {
  switch (status) {
    case 'scheduled':
      return '#FF9500';
    case 'live':
      return '#FF3B30';
    case 'completed':
      return '#9E9E9E';
    default:
      return '#FF9500';
  }
};

// Truncate text
export const truncate = (text, maxLength = 30) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

// Get rank suffix (1st, 2nd, 3rd, etc.)
export const getRankSuffix = (rank) => {
  if (!rank) return '-';
  const j = rank % 10;
  const k = rank % 100;
  if (j === 1 && k !== 11) return `${rank}st`;
  if (j === 2 && k !== 12) return `${rank}nd`;
  if (j === 3 && k !== 13) return `${rank}rd`;
  return `${rank}th`;
};

// Validate phone number (Indian format)
export const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[1-9]\d{9,14}$/;
  return phoneRegex.test(phone);
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return '??';
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};
