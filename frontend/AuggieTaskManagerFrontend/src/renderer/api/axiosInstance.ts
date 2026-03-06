/**
 * Base axios instance for Django API.
 * Set baseURL and add request/response interceptors (auth, errors) here.
 */
// import axios from 'axios';
// import { API_BASE } from '../../config';

// export const axiosInstance = axios.create({
//   baseURL: API_BASE,
//   headers: { 'Content-Type': 'application/json' },
// });

// axiosInstance.interceptors.request.use((config) => { /* e.g. add token */ return config; });
// axiosInstance.interceptors.response.use((r) => r, (err) => { /* e.g. 401 logout */ return Promise.reject(err); });

export {};
