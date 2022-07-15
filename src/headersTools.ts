import axios, { AxiosResponse } from "axios";

const getHeader = async (
  response: AxiosResponse<any>,
  header: string,
  regex?: RegExp
) => {
  const str = response.headers[header];
  console.log("1", str);
  if (regex) {
    const m = regex.exec(str);
    console.log("2", m);
    return m;
  }
  return str;
};

export const getName = (response: AxiosResponse<any>) => {
  const regex = /(?<=\")(.*?)(?=\")/;
  return getHeader(response, "content-disposition", regex);
};

export const getContentType = (response: AxiosResponse<any>) => {
  return getHeader(response, "content-type");
};
