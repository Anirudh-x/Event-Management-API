// Efficient sorting with custom comparator
const sortEvents = (events) => {
  return events.sort((a, b) => {
    // First: date (ascending)
    const dateCompare = new Date(a.dateTime) - new Date(b.dateTime);
    if (dateCompare !== 0) return dateCompare;
    
    // Then: location (case-insensitive alphabetical)
    return a.location.localeCompare(b.location, undefined, {
      sensitivity: 'base',
      numeric: true
    });
  });
};

// Efficient registration counting
const calculateStats = (event, registrationsCount) => {
  return {
    total_registrations: registrationsCount,
    remaining_capacity: event.capacity - registrationsCount,
    percentage_used: Math.round((registrationsCount / event.capacity) * 100)
  };
};

module.exports = { sortEvents, calculateStats };