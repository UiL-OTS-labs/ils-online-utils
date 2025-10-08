import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { DSRestAPI, ParticipantSessionData } from "../src/dsrestapi";

// It would be able to
import { server } from "./mocks/node";
import {
    mock_host,
    mock_access_key,
    mock_meta_data,
    mock_session,
} from "./mocks/rest-handler";
import { ParticipantSession } from "../src/session";

describe("DSRestAPI objects", () => {
    test("Can be created", () => {
        let net_api = new DSRestAPI(mock_host);
        expect(net_api).toBeDefined();
    });
});

describe("DSRestAPI objects query the right endpoints", () => {
    const endpoint = "api/";

    let net_api = new DSRestAPI(mock_host, mock_access_key);

    beforeEach(() => {
        server.listen();
    });

    afterEach(() => {
        server.resetHandlers();
        server.close();
    });

    test("metadata requests go to right url", async () => {
        let result = await net_api.metaData();
        expect(result.state).toEqual(mock_meta_data.state);
    });

    test("Session requests go to right url", async () => {
        let result = await net_api.startSession();
        expect(result.group).toEqual(mock_session.group);
        expect(result.uuid).toEqual(mock_session.uuid);
        expect(result.state).toEqual(mock_session.state);
        expect(result.subject_id).toEqual(mock_session.subject_id);
    });

    test("Uploads go to right url", async () => {
        const session_data: ParticipantSessionData = {
            uuid: "some-uuid",
            group: "some-group",
            subject_id: 2,
            state: 1,
        };
        const session = new ParticipantSession(session_data);
        expect(net_api.uploadSession(session, "some-data")).resolves;
    });
});
