import moment from 'moment';
import axios from 'axios';
import { useEffect } from 'react';
import imageCompression from 'browser-image-compression';

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

export const uploadFileToSpaces = async (file, presignedUrl) => {
  const isolatedAxios = axios.create(); // fresh instance

  return isolatedAxios.put(presignedUrl, file, {
    headers: {
      'Content-Type': file.type, // must match what you signed!
      'x-amz-acl': 'public-read'
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    transformRequest: [(data, headers) => {
      // REMOVE all inherited headers — especially from axios.defaults or interceptors
      Object.keys(headers).forEach(key => delete headers[key]);
      headers['Content-Type'] = file.type;
      headers['x-amz-acl'] = 'public-read';
      return data;
    }]
  });
};

export const convertImagetoWebp = async (file) => {
  if (!file || !file.type.startsWith('image/')) {
    throw new Error('File is not a valid image');
  }

  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.8,
  };

  try {
    const compressedBlob = await imageCompression(file, options);

    // Rename file to have .webp extension
    const webpFileName = file.name.replace(/\.\w+$/, '.webp');
    const webpFile = new File([compressedBlob], webpFileName, {
      type: 'image/webp',
      lastModified: Date.now(),
    });

    return webpFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
};
