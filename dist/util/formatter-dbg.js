sap.ui.define([
    "sap/ui/core/format/DateFormat"
], function (DateFormat) {
    "use strict";
    return {
    	   formatCurrentDateTime: function() {
            return new Date().toLocaleString(); // Customize the date format as needed
        },
formatDate:function(date) {
    // Helper function to add leading zero if needed
    const padZero = (number) => number.toString().padStart(2, '0');
    
    // Check if date is null or undefined
    if (!date) {
        return ''; // Return an empty string or some placeholder text if date is null or undefined
    }
    
    // Extracting date components
    const day = padZero(date.getDate());
    const month = padZero(date.getMonth() + 1); // Months are zero-based
    const year = date.getFullYear().toString().slice(-2); // Last two digits of the year
    const hours = padZero(date.getHours());
    const minutes = padZero(date.getMinutes());
    const seconds = padZero(date.getSeconds());
    
    // Formatting date in DD-MM-YY HH:MM:SS
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
},
   	Delete: function (value) {
            if (value === "X") {
                return "Deleted";
            } else if (value === null || value === undefined || value === "") {
                return "";
            }
            return value;
        }
    };
});