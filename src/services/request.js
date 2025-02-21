import axios from 'axios';
import Cookies from 'js-cookie';

const storedToken = Cookies.get('token');
const bearerToken = `Bearer ${storedToken}`;

// request header configuration
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8';
axios.defaults.headers.post.Accept = 'application/json';
axios.defaults.headers.common.Authorization = storedToken === undefined ? null : bearerToken;


// console.log('BEARERRRR TOKEN', axios.defaults.headers.common.Authorization)
const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://community.wotgonline.com/api';

console.log('[[STATUS]]', process.env.NODE_ENV)


/**
 * handle check request method
 * based on method, use axios to handle request
 * @param url
 * @param options
 * @returns {Promise<AxiosResponse<T>>}
 */
const requestMethod = (url, options = {}) => {
  const { method = 'GET', ...option } = options;
  switch (method) {
    case 'GET':
      return axios.get(baseUrl + url, option);
    case 'POST':
      return axios.post(baseUrl + url, option);
    case 'POST_FORM_DATA':
      return axios.post(baseUrl + url, option.formData);
    case 'PUT_FORM_DATA':
      return axios.put(baseUrl + url, option.formData);
    case 'PUT':
      return axios.put(baseUrl + url, option);
    case 'DELETE':
      return axios.delete(baseUrl + url, { data: option });
    case 'GET_BLOB':
      return axios.get(baseUrl + url, { responseType: 'blob', timeout: 30000 });
    default:
      return axios.get(baseUrl + url, option);
  }
};

/**
 * Check the response status
 * @param res
 * @returns {*}
 */
const checkApiStatus = (res) => {
  const { data, status } = res;
  const { msg } = data;

  if (status >= 200 && status < 300) return res;

  const err = { message: msg };

  return Promise.reject(err);
};

/**
 * handle response data format
 * @param res
 * @returns {Promise<{data: *, message: *, status: *}>}
 */
const handleResponseData = (res) => {
  const { data } = res;
  return Promise.resolve(data);
};

/*
const showSnackShit = (msg) => {
  // display snackbar using notistack
  enqueueSnackbar(msg, {
    variant: 'error'
  });
};

/**
 * handle throw error
 * @param err
 * @returns {Promise<never>}
 */
const handleThrowError = (err) => {
  return Promise.reject(err);
};
/**
 * Overall fetch method
 * @param url
 * @param options
 * @returns {Promise<{data: *, status: *} | never>}
 */
const fetch = (url, options) => {
  return requestMethod(url, options)
    .then(checkApiStatus)
    .then(handleResponseData)
    .catch(handleThrowError);
};

/**
 * handle GET request
 * @param url
 * @param options
 * @constructor
 */
export const GET = (url, options) => fetch(url, { ...options, method: 'GET' });

/**
 * handle POST request
 * @param url
 * @param options
 * @constructor
 */
export const POST = (url, options) => fetch(url, { ...options, method: 'POST' });

/**
 * handle POST request
 * @param url
 * @param options
 * @constructor
 */
export const POST_FORM_DATA = (url, options) =>
  fetch(url, { ...options, method: 'POST_FORM_DATA' });

/**
 * handle POST request
 * @param url
 * @param options
 * @constructor
 */
export const PUT_FORM_DATA = (url, options) => fetch(url, { ...options, method: 'PUT_FORM_DATA' });

/**
 * handle PUT request
 * @param url
 * @param options
 * @constructor
 */
export const PUT = (url, options) => fetch(url, { ...options, method: 'PUT' });

/**
 * handle delete request
 * @param url
 * @param options
 * @constructor
 */
export const DELETE = (url, options) => fetch(url, { ...options, method: 'DELETE' });

/**
 * handle GET BLOB request
 * @param url
 * @param options
 * @constructor
 */
// export const GET_BLOB = (url, options) => fetch(url, { ...options, method: 'GET_BLOB' });