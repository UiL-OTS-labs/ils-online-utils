import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import { API } from "../src/api";
import { NetworkAPI } from "../src/network";

describe("Api Objects", () => {
    let api: API;
    let host = "https://www.some-host.ils.nl";

    beforeEach(() => {
        api = new API(host);
    });

    test("Can be instantiated", () => {
        expect(api).toBeDefined();
        expect(api.host).toEqual(new URL(host));
    });

    test("Start without a session", () => {
        expect(api.sessionStarted()).toBeFalsy();
    });

    test("Can start a new ParticipantSesison", () => {});
});
