export const formatPayloadParams = (params) => {
    let res = Object.keys(params)
    .filter(key => params[key] !== undefined)
    .map((key) => `${encodeURIComponent(key)}=${decodeURIComponent(params[key])}`)
    .join('&');
  
    return res;
  };