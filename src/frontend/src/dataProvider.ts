import jsonServerProvider from "ra-data-json-server";

// const httpClient = (url, options = {}) => {
//     if (!options.headers) {
//         options.headers = new Headers({Accept: 'application/json'});
//     }

//     return Auth.currentSession()
//         .then(data => {
//             options.headers.set('Authorization', data);
//             return options;
//         })
//         .then(options => 
//             return fetchUtils.fetchJson(url, options)
//         );
// }

export const dataProvider = (() => {
    if (import.meta.env.VITE_BACKEND_API_URL) {
      return jsonServerProvider(import.meta.env.VITE_BACKEND_API_URL);
    } else {
      return jsonServerProvider("https://" + window.location.origin + "/api/");
    }
})();
