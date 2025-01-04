import moment from 'moment';

/**
 * convert format price
 * @param {*} params
 */
export const formatPriceX = (price, key = '') => {
  const formattedPrice = parseFloat(price)
    .toFixed(2)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return key === '' ? `₱${formattedPrice}` : `${key}₱ ${formattedPrice}`;
};

export const formatPriceY = (price, key = '') => {
  const formattedPrice = parseFloat(price)
    .toFixed(2)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return key === '' ? `${formattedPrice}` : `${key} ${formattedPrice}`;
};

/**
 * convert object to query string
 * @param {*} params
 */
export const convertQueryString = (params) => {
  return Object.keys(params)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
};


/**
 * anti boolean 'true'
 * @param {*} params
 */
export const evalBoolean = (params) => {
  return params === 'true' || params === true;
};


/**
 * convert date format
 * @param {*} params
 */
 export const convertMomentWithFormat = (v) => {
   return moment(v).format('MM/DD/YYYY');
 };

 export const convertMomentWithFormatWhole = (v) => {
   return moment(v).format('MMMM DD, YYYY');
 };

 export const evaluateBooleanFields = (v) => {
   const evalObj = v;
   Object.keys(evalObj).map(fld => {
     if (evalObj[fld] === 'true' || evalObj[fld] === 'false') {
       evalObj[fld] = evalBoolean(evalObj[fld]);
     }

     /*if (knownBooleanFields.includes(evalObj[fld])) {
       evalObj[fld] = evalObj[fld] === '' ? false : true;
     }*/

     return fld;
   })
   return evalObj;
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