import { NetworkAPI } from "./network";
import { ParticipantSession } from "./session";

/**
 * Class for handling all requests to the experiment-datatstore server
 *
 * This class handles the communication with the experiment-datastore server. So
 * if you want to send/retrieve information from the server, you'll should be using
 * this class.
 */
class API {
    host: URL;
    private _net_api: NetworkAPI;

    private cache: { session: ParticipantSession | null; meta_data: null } = {
        session: null,
        meta_data: null,
    };

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
     * Check whether the session has been started
     */
    sessionStarted() {
        return this.cache.session !== null;
    }

    /**
     * ToDo rename to startSession()
     * Start a new participant session on the server
     * @param access_key - Access key for the experiment
     * @returns a promise that contains the parsed JSON returned from the server
     */
    async sessionStart(access_key: string): Promise<ParticipantSession> {
        // Check whether we've started a session
        if (this.cache.session !== null) {
            return this.cache.session;
        }

        let object = await this._net_api.post(
            this.url(`${access_key}/participant/`),
        );
        return ParticipantSession.fromObject(object);
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
