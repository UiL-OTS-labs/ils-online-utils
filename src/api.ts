import { DSRestAPI, type MetaData } from "./dsrestapi";
import { ParticipantSession } from "./session";

/**
 * Class for handling all requests to the experiment-datatstore server
 *
 * This class handles the communication with the experiment-datastore server. So
 * if you want to send/retrieve information from the server, you'll should be using
 * this class.
 */
class API {
    private priv_api: DSRestAPI;

    private cache: { session: ParticipantSession | null; meta_data: null } = {
        session: null,
        meta_data: null,
    };

    /**
     * Initializes the api connection
     *
     * @param host - base URL for all requests (should include https://)
     *               unless you specify the net_api parameter, you should
     *               specify the host.
     * @param access_key - The access key that belongs to the experiment with
     *                     whom we like to communicate.
     * @param net_api - the DSRestAPI instance that handles the communication
     *                  with the dataserver. When left undefined a default
     *                  instance is chozen, which typically does the right
     *                  thing. Than parameters will of host and access_key
     *                  will be unused.
     */
    constructor(host: URL | string, access_key: string, net_api?: DSRestAPI) {
        if (net_api != undefined) {
            this.priv_api = net_api;
        } else {
            if (typeof host != "string" && !(host instanceof URL)) {
                throw TypeError("Host should be URL|string");
            }
            if (typeof access_key != "string") {
                throw TypeError("acces_key should be string");
            }
            this.priv_api = new DSRestAPI(host, access_key);
        }
    }

    get host() {
        return this.priv_api.host;
    }

    get access_key() {
        return this.priv_api.access_key;
    }

    /**
     * Check whether the session has been started
     */
    sessionStarted() {
        return this.cache.session != null;
    }

    /**
     * Start a new participant session on the server
     *
     * Requests the server, to start a new ParticipantSession for this user. If
     * a session already has been started an cached version will be used.
     *
     * @param access_key - Access key for the experiment
     *
     * @returns a promise that contains the parsed JSON returned from the server
     *
     * @throws HostNotSetError
     * When the Api object is created the host (of the dataserver) should be set
     * This might be raised when it isn't set.
     *
     * @throws ApiError
     * When the Api object is created the host (of the dataserver) should be set
     * This might be raised when it isn't set.
     *
     */
    async startSession(): Promise<ParticipantSession> {
        if (this.cache.session != null) {
            return this.cache.session;
        }

        // This call might throw the specified exceptions
        let session_data = await this.priv_api.startSession();

        return new ParticipantSession(session_data);
    }

    /**
     * Upload the data from one session
     *
     * @param access_key - Access key for the experiment
     *
     * @throws {@link HostNotSetError}
     * When the Api object is created the host (of the dataserver) should be set
     * This might be raised when it isn't set. This is likely due to a programmer error.
     *
     * @throws {@link ApiError}
     * This is thrown when the request to the server returns an error.
     *
     * @returns a promise that contains the parsed JSON returned from the server
     */
    async sessionUpload(
        session: ParticipantSession,
        data: string,
    ): Promise<void> {
        return this.priv_api.uploadSession(session, data);
    }

    /**
     * retrieve the meta data of this experiment from the dataserver.
     *
     * @returns a promise with the metadata
     */
    async metaData(): Promise<MetaData> {
        return this.priv_api.metaData();
    }
}

export { API };
