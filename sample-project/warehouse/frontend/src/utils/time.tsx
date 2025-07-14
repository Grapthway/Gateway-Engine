// TimeUtils.ts

export const getCurrentTimestamp = (): string => {
    return new Date().toISOString(); // UTC Timestamp
};

export const getTimezoneOffset = (): number => {
    return new Date().getTimezoneOffset() / -60; // Convert to hours
};

export const convertToLocalTime = (utcTimestamp?: string): string => {
    const timestamp = utcTimestamp || getCurrentTimestamp();
    
    const utcDate = new Date(timestamp); // JavaScript already interprets this as UTC
    
    return utcDate.toLocaleString('en-GB', { 
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, 
        day: '2-digit', month: '2-digit', year: 'numeric', 
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false
    }).replace(',', ''); // Ensure formatting remains consistent
};
