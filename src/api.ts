import { NetworkAPI } from "./network";

/**
 * Class for handling all requests to the server
 */
class API {
    host: URL;
    private _net_api: NetworkAPI;

    /**
     * Initializes the api connection
     *
     * @param host - base URL for all requests (should include https://)
     * @param net_api - the NetworkAPI instance that handles the communication
     *                  with the dataserver. When left undefined a default
     *                  instance is chozen, which typically does the right
     *                  thing.
     */
    constructor(
        host: URL | string,
        net_api: NetworkAPI | undefined = undefined,
    ) {
        this.host = new URL(host);
        if (net_api != undefined) {
            this._net_api = net_api;
        } else {
            this._net_api = new NetworkAPI();
        }
    }

    // Concatenates path to host
    private url(path: string) {
        return new URL(path, this.host);
    }

    /**
     * Start a new participant session on the server
     * @param access_key - Access key for the experiment
     * @returns {Promise<Object>} a promise that contains the parsed JSON returned from the server
     */
    sessionStart(access_key: string): Promise<Object> {
        return this._net_api.post(this.url(`${access_key}/participant/`));
    }

    /**
     * Start a new participant session on the server
     * @param access_key - Access key for the experiment
     * @returns a promise that contains the parsed JSON returned from the server
     */
    sessionUpload(
        access_key: string,
        session_id: string,
        data: string,
    ): Promise<Object> {
        return this._net_api.post(
            this.url(`${access_key}/upload/${session_id}/`),
            data,
        );
    }
}

export { API };
