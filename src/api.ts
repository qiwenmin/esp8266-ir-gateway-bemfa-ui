import {Base64} from "js-base64";

let Api = {
    createConnection: (username: string, password: string, url: string) => {
        let call = async (path: string, method = 'GET', auth = false, data = null) => {
            let init = {
                headers: new Headers({
                    'Content-Type': 'application/json'
                }),
                method: method
            };

            if (data) {
                init['body'] = JSON.stringify(data);
            }

            if (auth) {
                init.headers.append('Authorization', 'Basic ' + Base64.encode(username + ':' + password));
                init['credentials'] = 'omit'; //'include';

                if (url) {
                    init['mode'] = 'cors';
                }
            }

            let response: Response;

            if ((!auth) && (method === 'GET' || method === 'DELETE') ){
                response = await fetch(url + path);
            } else {
                response = await fetch(url + path, init);
            }

            if (response.ok) {
                return await response.json();
            }

            let statusObj = {
                status: response.status,
                statusText: response.statusText
            };

            let err = new Error(`ApiError: ${statusObj.status} - ${statusObj.statusText}`);
            err['responseStatus'] = statusObj;
            throw err;
        };

        let conn = {
            getVersion:  async () => {
                return call('/version', 'GET');
            },

            getStatus: async () => {
                return call('/api/status', 'GET', true);
            },

            getBemfaConfig: async () => {
                return call('/api/bemfa/config', 'GET', true);
            },

            getBemfaTopics: async () => {
                return call('/api/bemfa/topics', 'GET', true);
            },

            putBemfaConfig: async (cfg) => {
                // return (async () => {
                //     return { rebootRequired: true };
                // })();
                return call('/api/bemfa/config', 'PUT', true, cfg);
            },

            _bemfaGetTopics: async (clientId: string) => {
                return fetch(`https://api.bemfa.com/api/device/v1/topic/?uid=${clientId}&type=2`)
                    .then(r => r.json());
            },

            getClass: () => {
                return Api;
            },
        };

        return conn;
    },

    maskBemfaClientId: (clientId: string) => {
        return clientId.substring(0, 6) + (clientId.length > 6 ? '...' : '');
    },
};

export default Api;
