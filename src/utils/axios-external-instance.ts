import axios from 'axios';
// a production ready axios instance
const axiosExternalInstance = axios.create({
  baseURL:  'https://backend-staging.beleef.com.au/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// request interceptor
axiosExternalInstance.interceptors.request.use(
  (config) => {
    // Add your request headers here
    // config.headers.set('Authorization', `Bearer ${localStorage.getItem('token')}`);
    return config;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error);
  }
);

// response interceptor
axiosExternalInstance.interceptors.response.use(
  (response) => {
    // Do something with response data
    return response;
  },
  (error) => {
    // Do something with response error
    return Promise.reject(error);
  }
);

// export the axios instance
export default axiosExternalInstance;