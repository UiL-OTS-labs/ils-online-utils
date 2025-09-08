
/**
 * type for http request methods
 */
type Method = "CONNECT" | "DELETE" | "GET" | "HEAD" | "OPTIONS" | "PATCH" | "POST" | "PUT" | "TRACE" ;

/**
 * Class for handling all requests to the server
 */
class API {
    host: URL;
    /**
     * Initializes the api connection
     * @param host - base URL for all requests (should include https://)
     */
    constructor(host: URL | string) {
        this.host = new URL(host);
    }

    /**
     * Performs a request
     * @param url - URL for the request, relative to the base URL used when initializing the API class
     * @param method - HTTP method (e.g. GET/POS)
     * @param data - Data to be sent to the server, in plain text
     * @returns {Promise<Object>} a promise that contains the parsed JSON returned from the server
     */
    _request(url: URL | string, method: Method, data: string = "") : Promise<Object> {
        const retries =  5;
        let sleep = 500;
        let params = {
            method: method,
            body: data.length > 0 ? new Blob([data], {type: 'text/plain'}) : undefined
        };
        return new Promise(async (resolve, reject) => {
            let response = null;
            let error_save;
            for(let i = 0; i < retries; i++) {
                try {
                    response = await fetch(new URL(url, this.host), params);
                    break;
                }
                catch (error) {
                    // sleep for a bit
                    error_save = error;
                    await (new Promise(r => setTimeout(r, sleep)));
                    sleep *= 2;
                }
            }

            if (response == null) {
                // out of retries
                reject(error_save);
                return;
            }

            if (response.ok) {
                resolve(await response.json());
            }
            else {
                try {
                    reject(await response.json());
                }
                catch {
                    reject(await response.text());
                }
            }
        });
    }

    /**
     * Performs an HTTP GET request
     * @param url - URL for the request, relative to the base URL used when initializing the API class
     * @returns a promise that contains the parsed JSON returned from the server
     */
    _get(url: URL|string) : Promise<Object> {
        return this._request(url, 'GET', undefined);
    }

    /**
     * Performs an HTTP POST request
     * @param url - URL for the request, relative to the base URL used when initializing the API class
     * @param data - Data to be sent to the server, in plain text
     * @returns {Promise<Object>} a promise that contains the parsed JSON returned from the server
     */
    _post(url: URL|string, data: string = "") : Promise<Object> {
        return this._request(url, 'POST', data);
    }

    /**
     * Start a new participant session on the server
     * @param access_key - Access key for the experiment
     * @returns {Promise<Object>} a promise that contains the parsed JSON returned from the server
     */
    sessionStart(access_key: string) : Promise<Object> {
        return this._post(`${access_key}/participant/`);
    }

    /**
     * Start a new participant session on the server
     * @param access_key - Access key for the experiment
     * @returns a promise that contains the parsed JSON returned from the server
     */
    sessionUpload(access_key: string, session_id: string, data: string) : Promise<Object> {
        return this._post(`${access_key}/upload/${session_id}/`, data);
    }
}


export {
    API
};
