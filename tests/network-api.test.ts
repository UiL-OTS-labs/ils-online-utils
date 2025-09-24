import {
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    expect,
    test,
    vi,
} from "vitest";
import { NetworkAPI } from "../src/network";

// It would be able to
import { server } from "./mocks/node";
import { DefaultTestGet, mock_host } from "./mocks/rest-handler";

describe("NetworkAPI objects", () => {
    test("Can be created", () => {
        let net_api = new NetworkAPI();
        expect(net_api).toBeDefined();
    });
});

describe("NetworkAPI objects query the right endpoints", () => {
    const endpoint = "api/";

    let net_api = new NetworkAPI();

    beforeEach(() => {
        server.listen();
    });

    afterEach(() => {
        server.resetHandlers();
        server.close();
    });

    test("GET requests go to right endpoint", async () => {
        let result = await net_api.get(mock_host + endpoint);

        expect("get_request" in result);
        // make typescript happy, but there must be a better way
        if ("get_request" in result) {
            expect(result.get_request).toBeTruthy();
        }
    });

    test("Post requests go to right endpoint", async () => {
        let net_api = new NetworkAPI();

        let result = await net_api.post(mock_host + endpoint);

        expect("post_request" in result);
        // make typescript happy, but there must be a better way
        if ("post_request" in result) {
            expect(result.post_request).toBeTruthy();
        }
    });
});
