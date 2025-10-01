import { NetworkAPI, type MetaData } from "./network";
import { ParticipantSession } from "./session";

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

/**
 * Class for handling all requests to the experiment-datatstore server
 *
 * This class handles the communication with the experiment-datastore server. So
 * if you want to send/retrieve information from the server, you'll should be using
 * this class.
 */
class API {
    private _net_api: NetworkAPI;

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
     * @param net_api - the NetworkAPI instance that handles the communication
     *                  with the dataserver. When left undefined a default
     *                  instance is chozen, which typically does the right
     *                  thing.
     */
    constructor(
        host: URL | string,
        net_api: NetworkAPI | undefined = undefined,
    ) {
        if (net_api != undefined) {
            this._net_api = net_api;
        } else {
            this._net_api = new NetworkAPI();
            this.host = host;
        }
    }

    set host(host: URL | string) {
        this._net_api.host = host;
    }

    get host(): URL | string | undefined {
        return this._net_api.host;
    }

    /**
     * Check whether the session has been started
     */
    sessionStarted() {
        return this.cache.session !== null;
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
    async startSession(access_key: string): Promise<ParticipantSession> {
        if (this.cache.session !== null) {
            return this.cache.session;
        }

        // This call might throw the specified exceptions
        let session_data = await this._net_api.startSession(
            urls.session.start(access_key),
        );

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
        access_key: string,
        session: ParticipantSession,
        data: string,
    ): Promise<void> {
        return this._net_api.uploadSession(
            urls.session.upload(access_key, session.uuid),
            data,
        );
    }

    async metaData(access_key: string): Promise<MetaData> {
        return this._net_api.metaData(urls.meta_data(access_key));
    }
}

export { API };
