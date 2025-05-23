import moment from 'moment';
import axios from 'axios';
import { useEffect } from 'react';


const plainAxios = axios.create();

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

 export const convertMomentWithFormat = (v) => {
  return moment(v).fromNow();
 };

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

export const useScrollRestore = (key = "bibleScrollY", delay = 50) => {
  useEffect(() => {
    let scrollY = null;

    try {
      scrollY = sessionStorage.getItem(key);
    } catch (err) {
      console.warn("Scroll restore failed: sessionStorage not available", err);
    }

    if (scrollY !== null) {
      const scrollTo = parseInt(scrollY, 10);

      if (!isNaN(scrollTo)) {
        const timeout = setTimeout(() => {
          window.scrollTo({ top: scrollTo, behavior: "auto" });
          sessionStorage.removeItem(key);
        }, delay);

        return () => clearTimeout(timeout); // Cleanup timeout on unmount
      }
    }
  }, [key, delay]);
};

export const saveScrollPosition = (key = "bibleScrollY") => {
  sessionStorage.setItem(key, window.scrollY.toString());
};

export const uploadFileToSpaces = async (file, presignedUrl, onProgress) => {
  const isolatedAxios = axios.create(); // fresh instance

  return isolatedAxios.put(presignedUrl, file, {
    headers: {
      'Content-Type': file.type, // must match what you signed!
      'x-amz-acl': 'public-read'
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        const percent = Math.round((e.loaded * 100) / e.total);
        onProgress(percent);
      }
    },
    transformRequest: [(data, headers) => {
      // REMOVE all inherited headers — especially from axios.defaults or interceptors
      Object.keys(headers).forEach(key => delete headers[key]);
      headers['Content-Type'] = file.type;
      headers['x-amz-acl'] = 'public-read';
      return data;
    }]
  });
};

