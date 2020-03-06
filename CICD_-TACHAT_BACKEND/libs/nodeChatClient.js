const axios = require("axios");
// const apiUrl = "http://localhost:9001/api/v1";

const apiUrl = "http://socket_server:9001/api/v1";

const axiosInstance = axios.create({
  baseURL: apiUrl
});

function register() {
  const Url = getUrl(`${userEndpoint()}/register`);
  return axiosInstance.post(Url, {}).then(handleSuccess).catch(handleError);
}

function createSession(accessKey) {
  const Url = getUrl(`${userEndpoint()}/${accessKey}/session`);
  return axiosInstance.post(Url, {}).then(handleSuccess).catch(handleError);
}

function getUserRooms(accessKey) {
  const Url = getUrl(`${userEndpoint()}/${accessKey}/rooms`);
  return axiosInstance.get(Url).then(handleSuccess).catch(handleError);
}

function assignRooms(accessKey, rooms) {
  const Url = getUrl(`${userEndpoint()}/${accessKey}/rooms`);
  return axiosInstance
    .post(Url, { rooms })
    .then(handleSuccess)
    .catch(handleError);
}

function userEndpoint() {
  return "/user";
}

function getUrl(endpointUrl) {
  return `${apiUrl}${endpointUrl}`;
}

function handleSuccess(details) {
  return details.data;
}

function handleError(err) {
  throw err.response.data.errors;
}

module.exports = {
  register,
  createSession,
  getUserRooms,
  assignRooms
};
