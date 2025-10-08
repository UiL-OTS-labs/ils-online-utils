import { expect, describe, it, test, beforeEach, vi } from "vitest";
import * as session from "../src/session";
import { API } from "../src/api";
import { DSRestAPI, ParticipantSessionData } from "../src/dsrestapi";

const FAKE_HOST = "https://www.fake.nl";
const API_KEY = "/api/";

const KEY = "01e6506c-8538-4f83-bb3f-f7cf2ba7f63f";
const SESSION_UUID = "b76ed785-2b90-4d0a-9c88-47ae917d3d6e";

const mock_response: ParticipantSessionData = {
    uuid: SESSION_UUID,
    group: "A",
    subject_id: 1, //"xyz",
    state: 1,
};

describe("session api", () => {
    const DSRestAPI = vi.fn(function (host, access_key): DSRestAPI {
        this._host = host;
        this._access_key = access_key;
    });
    DSRestAPI.prototype.startSession = vi.fn();
    DSRestAPI.prototype.uploadSession = vi.fn();

    let mocked_net_api: DSRestAPI;

    beforeEach(() => {
        vi.clearAllMocks();
        mocked_net_api = new DSRestAPI(FAKE_HOST, KEY);
    });

    it("should start a session", async () => {
        vi.mocked(mocked_net_api.startSession).mockReturnValueOnce(
            Promise.resolve(mock_response),
        );

        // In real use you typically only specify the host.
        let api = new API(FAKE_HOST, KEY, mocked_net_api);

        await api.startSession().then((session: session.ParticipantSession) => {
            expect(session.group).toBe("A");
            expect(session.state).toBe(1);
            expect(session.state_string).toBe("Started");
            expect(session.uuid).toBe("b76ed785-2b90-4d0a-9c88-47ae917d3d6e");
            expect(
                vi.mocked(mocked_net_api).startSession,
            ).toHaveBeenCalledOnce();
        });
    });

    it("should upload sessions", async () => {
        vi.mocked(mocked_net_api.startSession).mockReturnValueOnce(
            Promise.resolve(mock_response),
        );

        let api = new API(FAKE_HOST, KEY, mocked_net_api);
        let stored_session = await api.startSession();

        expect(await api.sessionUpload(stored_session, "some data"))
            .toHaveResolved;
        expect(mocked_net_api.uploadSession).toHaveBeenCalledOnce();
    });

    it("should not fail silently", async () => {
        vi.mocked(mocked_net_api.startSession).mockReturnValueOnce(
            Promise.resolve(mock_response),
        );

        vi.mocked(mocked_net_api.uploadSession).mockImplementation(async () => {
            throw new Error("Some random error");
        });

        let api = new API(FAKE_HOST, KEY, mocked_net_api);
        let stored_session = await api.startSession();

        await expect(() =>
            api.sessionUpload(stored_session, ""),
        ).rejects.toThrowError("Some random error");
    });
});
