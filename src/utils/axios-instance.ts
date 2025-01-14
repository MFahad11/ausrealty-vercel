import axios from 'axios';
// a production ready axios instance
const axiosInstance = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? process.env.API_URL_PROD : process.env.API_URL_LOCAL,
  timeout: 15000, // 15 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// request interceptor
axiosInstance.interceptors.request.use(
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
axiosInstance.interceptors.response.use(
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
export default axiosInstance;
