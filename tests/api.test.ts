import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import { API } from "../src/api";
import { DSRestAPI } from "../src/dsrestapi";

describe("Api Objects", () => {
    let api: API;
    let host = "https://www.some-host.ils.nl";
    let access_key = "should-be-a-uuid";

    beforeEach(() => {
        api = new API(host, access_key);
    });

    test("Can be instantiated", () => {
        expect(api).toBeDefined();
        expect(api.host).toEqual(new URL(host));
    });

    test("Start without a session", () => {
        expect(api.sessionStarted()).toBeFalsy();
    });

    test("Protects javascript users from forgetting/passing invalid construction parameters", () => {
        let api: API;
        expect(() => {
            api = new API();
        }).throws(TypeError);
        expect(() => {
            api = new API(host);
        }).throws(TypeError);
        expect(() => {
            api = new API(host, 2);
        }).throws(TypeError);
        expect(() => {
            api = new API(2, host);
        }).throws(TypeError);
    });
});
