import { type Method } from "./method";
import { type ParticipantSession } from "./session";

export { NetworkAPI };

const urls = {
    meta_data: function (access_key: string) {
        return `/api/${access_key}/`;
    },
    session: {
        start: function (access_key: string) {
            return `/api/${access_key}/particpant/`;
        },
        upload: function (access_key: string, participant_id: string) {
            return `/api/${access_key}/upload/${participant_id}/`;
        },
    },
};

class HostNotSetError extends Error {
    constructor() {
        super("NetworkApi should be set");
        Object.setPrototypeOf(this, HostNotSetError.prototype);
    }
}

// Typescript enums are problematic
// export enum SessionState {
//     STARTED = 1,
//     COMPLETED,
//     REJECTED,
// }
// I would have like the enum above.
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
    private _host: URL;
    private _access_key: string;

    constructor(host: string | URL, access_key: string) {
        this._host = new URL(host);
        this._access_key = access_key;
    }

    get host() {
        return this._host;
    }

    get access_key() {
        return this._access_key;
    }

    /**
     * Performs a request
     * @param url - URL for the request, relative to the base URL used when initializing the API class
     * @param method - HTTP method (e.g. GET/POS)
     * @param data - Data to be sent to the server, in plain text
     *
     * @returns - a promise that contains the HttpResponse of the server
     */
    request(
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

    async startSession(): Promise<ParticipantSessionData> {
        const url = urls.session.start(this.access_key);
        let response = await this.post(url);
        return await response.json();
    }

    async uploadSession(
        session: ParticipantSession,
        data: string,
    ): Promise<void> {
        const url = urls.session.upload(this.access_key, session.uuid);
        let response = await this.post(url, data);
        console.assert(response.ok);
    }

    async metaData(): Promise<MetaData> {
        const url = urls.meta_data(this.access_key);
        let response = await this.get(url);
        return await response.json();
    }
}
