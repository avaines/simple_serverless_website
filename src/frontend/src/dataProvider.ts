import jsonServerProvider from "ra-data-json-server";
import { fetchUtils } from 'react-admin';
import { getJwtToken } from "./authProvider";

const httpClient = async (url: string, options: any = {}) => {
  options.user = {
      authenticated: true,
      token: await getJwtToken(),
  };
  return fetchUtils.fetchJson(url, options);
};

export const dataProvider = (() => {
    if (import.meta.env.VITE_BACKEND_API_URL) {
      return jsonServerProvider(import.meta.env.VITE_BACKEND_API_URL, httpClient);
    } else {
      return jsonServerProvider("https://" + window.location.origin + "/api/", httpClient);
    }
})();
