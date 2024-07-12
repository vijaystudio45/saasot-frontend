import axios from "axios";
import { BACKEND_API_URL } from "../environment";
import store from "../store";
//  import {constants} from '../shared';
const debugging = true;
const api = axios.create({
  baseURL: BACKEND_API_URL,
  //  baseURL: constants.API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
/**
  intercept any error responses from the api
  and check if the token is no longer valid.
  ie. Token has expired or user is no longer
  authenticated.
  logout the user if the token has expired
 **/
/* Log api requests */
api.interceptors.request.use(
  async (request) => {
    const accessToken = await store?.getState()?.authReducer?.userData?.token;
    request.headers["Authorization"] = `Bearer ${accessToken}`;
    if (debugging) {
      let logObj = {};
      if (request.method === "get") {
        logObj = { ...request };
        // Prevent unnecessary properties from logging
        delete logObj["url"];
        delete logObj["method"];
        delete logObj["headers"];
        delete logObj["baseURL"];
        delete logObj["transformRequest"];
        delete logObj["transformResponse"];
        delete logObj["timeout"];
        delete logObj["xsrfCookieName"];
        delete logObj["xsrfHeaderName"];
        delete logObj["maxContentLength"];
        delete logObj["maxBodyLength"];
      } else if (request.method === "post") {
        logObj = { ...request?.data };
      } else {
        logObj = { ...request };
      }
 
    }
    return request;
  },
  (err) => {
    return Promise.reject(err);
  }
);
/* Log api response & reset auth states if Access-Token is no longer valid */
api.interceptors.response.use(
  (response) => {
  
    return response;
  },
  (err) => {
  
    return Promise.reject(err);
  }
);
export default api;
