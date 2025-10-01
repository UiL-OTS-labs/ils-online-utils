import { type Method } from "./method";

export { NetworkAPI };

class HostNotSetError extends Error {
    constructor() {
        super("NetworkApi should be set");
        Object.setPrototypeOf(this, HostNotSetError.prototype);
    }
}

export type SessionState = 1 | 2 | 3;

export interface ParticipantSessionData {
    uuid: string;
    group: string;
    subject_id: number;
    state: SessionState;
}

// To do the server might translate this state...
// change to a enum.
type ExperimentState = "Open" | "Piloting" | "Closed";

export interface MetaData {
    state: ExperimentState;
}

export class ApiError extends Error {
    private response: Response;

    private cache: { json_content?: any } = {};

    constructor(response: Response, message: string) {
        super(message);
        console.assert(!response.ok);
        this.response = response;
        Object.setPrototypeOf(this, ApiError.prototype);
    }

    containsJson(): boolean {
        const content = this.response.headers.get("content-type");
        if (content) {
            return content.includes("application/json");
        }
        return false;
    }

    get status() {
        return this.response.status;
    }

    async json(): Promise<any> {
        if (!this.containsJson) {
            throw Error("The response doesn't contain json");
        }

        if (this.cache.json_content) {
            return this.cache.json_content;
        } else {
            this.cache.json_content = await this.response.json();
            return this.cache.json_content;
        }
    }
}

/**
 * Class for handling all requests to the server
 */
class NetworkAPI {
    _host: URL | undefined;

    constructor(host: string | URL | undefined = undefined) {
        if (host) {
            this._host = new URL(host);
        }
    }

    set host(hostname: URL | string) {
        this._host = new URL(hostname);
    }

    get host(): URL | undefined {
        return this._host;
    }

    /**
     * Performs a request
     * @param url - URL for the request, relative to the base URL used when initializing the API class
     * @param method - HTTP method (e.g. GET/POS)
     * @param data - Data to be sent to the server, in plain text
     *
     * @returns - a promise that contains the HttpResponse of the server
     */
    private request(
        url: URL | string,
        method: Method,
        data: string = "",
    ): Promise<Response> {
        const retries = 5;
        if (!this.host) {
            throw new HostNotSetError();
        }
        let sleep = 500;
        let params = {
            method: method,
            body:
                data.length > 0
                    ? new Blob([data], { type: "text/plain" })
                    : undefined,
        };
        return new Promise<Response>(async (resolve, reject) => {
            let response = null;
            let error_save;
            for (let i = 0; i < retries; i++) {
                try {
                    response = await fetch(new URL(url, this.host), params);
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
                resolve(await response);
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
    private async get(url: URL | string): Promise<Response> {
        return this.request(url, "GET", undefined);
    }

    /**
     * Performs an HTTP POST request
     * @param url - URL for the request, relative to the base URL used when initializing the API class
     * @param data - Data to be sent to the server, in plain text
     * @returns {Promise<Object>} a promise that contains the parsed JSON returned from the server
     */
    private async post(
        url: URL | string,
        data: string = "",
    ): Promise<Response> {
        return this.request(url, "POST", data);
    }

    async startSession(endpoint: string): Promise<ParticipantSessionData> {
        let response = await this.post(endpoint);
        return await response.json();
    }

    async uploadSession(endpoint: string, data: string): Promise<void> {
        let response = await this.post(endpoint, data);
        console.assert(response.ok);
    }

    async metaData(endpoint: string): Promise<MetaData> {
        let response = await this.get(endpoint);
        return await response.json();
    }
}
