import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import { API } from "../src/api";

describe("Api Objects", () => {
    let api: API;

    beforeEach(() => {
        api = new API("https://www.some-host.ils.nl");
    });

    test("Can be instantiated", () => {
        expect(api).toBeDefined();
    });

    test("Start without a session", () => {
        expect(api.sessionStarted()).toBeFalsy();
    });
});
