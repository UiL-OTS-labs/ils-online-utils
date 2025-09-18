import { type Method } from "./method";

export { NetworkAPI };

/**
 * Class for handling all requests to the server
 */
class NetworkAPI {
    /**
     * Performs a request
     * @param url - URL for the request, relative to the base URL used when initializing the API class
     * @param method - HTTP method (e.g. GET/POS)
     * @param data - Data to be sent to the server, in plain text
     * @returns {Promise<Object>} a promise that contains the parsed JSON returned from the server
     */
    private request(
        url: URL | string,
        method: Method,
        data: string = "",
    ): Promise<Object> {
        const retries = 5;
        let sleep = 500;
        let params = {
            method: method,
            body:
                data.length > 0
                    ? new Blob([data], { type: "text/plain" })
                    : undefined,
        };
        return new Promise(async (resolve, reject) => {
            let response = null;
            let error_save;
            for (let i = 0; i < retries; i++) {
                try {
                    response = await fetch(url, params);
                    break;
                } catch (error) {
                    // sleep for a bit
                    error_save = error;
                    await new Promise((r) => setTimeout(r, sleep));
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
            } else {
                try {
                    reject(await response.json());
                } catch {
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
    get(url: URL | string): Promise<Object> {
        return this.request(url, "GET", undefined);
    }

    /**
     * Performs an HTTP POST request
     * @param url - URL for the request, relative to the base URL used when initializing the API class
     * @param data - Data to be sent to the server, in plain text
     * @returns {Promise<Object>} a promise that contains the parsed JSON returned from the server
     */
    post(url: URL | string, data: string = ""): Promise<Object> {
        return this.request(url, "POST", data);
    }
}
