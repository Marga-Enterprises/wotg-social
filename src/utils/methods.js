import moment from 'moment';

/**
 * convert object to query string
 * @param {*} params
 */
export const convertQueryString = (params) => {
  // Check if params is a valid object
  if (!params || typeof params !== 'object') {
    return ''; // Return an empty string if params is invalid
  }

  // Convert the object to a query string
  return Object.keys(params)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
};


/**
 * convert date format
 * @param {*} params

 export const convertMomentWithFormat = (v) => {
   return moment(v).format('MM/DD/YYYY');
 };
 */
 export const convertMomentWithFormatWhole = (v) => {
   return moment(v).format('MMMM DD, YYYY');
 };

 export const useDebounce = (func, wait) => {
   let timeout;
   return (...args) => {
     if (timeout) clearTimeout(timeout);
     timeout = setTimeout(() => {
       timeout = null;
       func.apply(this, args);
     }, wait);
   };
 };

 export const formatUserName = (firstName, lastName) => {
  const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  return `${capitalize(firstName)} ${capitalize(lastName)}`;
};
