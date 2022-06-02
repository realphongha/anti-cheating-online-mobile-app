import axios from "axios";
import * as constants from "../utils/Constants";
import { Platform } from 'react-native';

export const UserApi = {
  login: (email, password) => {
    return axios({
      method: "post",
      url: `${constants.backend}/login`,
      data: {
        email: email,
        password: password
      },
      maxContentLength: 100000000,
      maxBodyLength: 1000000000,
    })
  },
  register: (email, password, confirmPassword, name, phone) => {
    return axios({
      method: "post",
      url: `${constants.backend}/register`,
      data: {
        email: email,
        password: password,
        c_password: confirmPassword,
        name: name,
        phone: phone,
        role: constants.USER_ROLE_STUDENT
      },
      maxContentLength: 100000000,
      maxBodyLength: 1000000000,
    })
  },
  getCurrentUser: (token) => {
    return axios({
      method: "get",
      url: `${constants.backend}/users/get_current`,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-access-token": token,
      },
      maxContentLength: 100000000,
      maxBodyLength: 1000000000,
    })
  },
  editCurrentUser: (token, email, oldPassword, newPassword, confirmPassword,
    fullName, phone, avatar) => {
    return axios({
      method: "put",
      url: `${constants.backend}/users/edit`,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-access-token": token,
      },
      data: {
        email: email,
        o_password: oldPassword,
        password: newPassword,
        c_password: confirmPassword,
        name: fullName,
        phone: phone,
        avatar: avatar
      },
      maxContentLength: 100000000,
      maxBodyLength: 1000000000,
    })
  },
  changeAvatar: (token, file) => {
    let formData = new FormData();
    formData.append('img', {
      name: file.fileName,
      type: file.type,
      uri:
        Platform.OS === 'android' ? file.uri : file.uri.replace('file://', ''),
    });
    return axios.put(`${constants.backend}/users/avatar`, formData, {
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
        "x-access-token": token,
      }
    })
  }
}