import axios from "axios";
import * as constants from "../utils/Constants";

export const ClassApi = {
  getList: (token, currentPage, classesPerPage, query) => {
    let url = `${constants.backend}/student/classes`;
    let queries = [];
    if (currentPage && classesPerPage){
      queries.push(`range=[${(currentPage-1)*classesPerPage}, ${currentPage*classesPerPage}]`);
    }
    if (query) {
      queries.push(`filter={"q":"${query}"}`)
    }
    if (queries.length > 0) {
      url += "?";
      url += queries.join("&");
    }
    return axios({
      method: "get",
      url: url,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-access-token": token,
      },
    })
  },
  getOne: (token, classId) => {
    let url = `${constants.backend}/classes/${classId}`;
    return axios({
      method: "get",
      url: url,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-access-token": token,
      },
    })
  },
}