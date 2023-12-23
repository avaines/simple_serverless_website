// Placeholder for RA sample JSON
// import jsonServerProvider from "ra-data-json-server";

// export const dataProvider = jsonServerProvider(
//   import.meta.env.VITE_JSON_SERVER_URL
// );

import { DataProvider, fetchUtils } from "react-admin";
import { stringify } from "query-string";


// const apiUrl = window.location.origin + '/api';
// const apiUrl = "https://d21ipm4iaxr9ak.cloudfront.net/api"
const apiUrl ="https://jsonplaceholder.typicode.com"
const httpClient = fetchUtils.fetchJson;


export const dataProvider: DataProvider = {
  getList: (resource, params) => {

      const { page, perPage } = params.pagination;
      const { field, order } = params.sort;
      const query = {
          sort: JSON.stringify([field, order]),
          range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
          filter: JSON.stringify(params.filter),
        };
        const url = `${apiUrl}/${resource}?${stringify(query)}`;
        console.log("DEBUG: getList of", resource, "from", url )

      return httpClient(url).then(({ headers, json }) => ({
          data: json,
          total: parseInt((headers.get('content-range') || "0").split('/').pop() || '0', 10),
      }));
  },

  getOne: (resource, params) =>
      httpClient(`${apiUrl}/${resource}/${params.id}`).then(({ json }) => ({
          data: json,
      })),

  getMany: (resource, params) => {
      const query = {
          filter: JSON.stringify({ id: params.ids }),
      };
      const url = `${apiUrl}/${resource}?${stringify(query)}`;
      console.log("DEBUG: getMany of", resource, "from", url )
      return httpClient(url).then(({ json }) => ({ data: json }));
  },

  getManyReference: (resource, params) => {
      const { page, perPage } = params.pagination;
      const { field, order } = params.sort;
      const query = {
          sort: JSON.stringify([field, order]),
          range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
          filter: JSON.stringify({
              ...params.filter,
              [params.target]: params.id,
          }),
      };
      const url = `${apiUrl}/${resource}?${stringify(query)}`;
      console.log("DEBUG: getManyReference of", resource, "from", url )

      return httpClient(url).then(({ headers, json }) => ({
          data: json,
          total: parseInt((headers.get('content-range') || "0").split('/').pop() || '0', 10),
      }));
  },

  update: (resource, params) =>
      httpClient(`${apiUrl}/${resource}/${params.id}`, {
          method: 'PUT',
          body: JSON.stringify(params.data),
      }).then(({ json }) => ({ data: json })),

  updateMany: (resource, params) => {
      const query = {
          filter: JSON.stringify({ id: params.ids}),
      };
      return httpClient(`${apiUrl}/${resource}?${stringify(query)}`, {
          method: 'PUT',
          body: JSON.stringify(params.data),
      }).then(({ json }) => ({ data: json }));
  },

  create: (resource, params) =>
      httpClient(`${apiUrl}/${resource}`, {
          method: 'POST',
          body: JSON.stringify(params.data),
      }).then(({ json }) => ({
          data: { ...params.data, id: json.id } as any,
      })),

  delete: (resource, params) =>
      httpClient(`${apiUrl}/${resource}/${params.id}`, {
          method: 'DELETE',
      }).then(({ json }) => ({ data: json })),

  deleteMany: (resource, params) => {
      const query = {
          filter: JSON.stringify({ id: params.ids}),
      };
      return httpClient(`${apiUrl}/${resource}?${stringify(query)}`, {
          method: 'DELETE',
      }).then(({ json }) => ({ data: json }));
  }
};
