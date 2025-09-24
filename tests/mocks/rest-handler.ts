import { http, HttpResponse } from "msw";

export const mock_host = "https://mock-rest-domain.com/";
export const handlers = [
    http.get(mock_host + "api/", () => {
        return HttpResponse.json({ get_request: true });
    }),
    http.post(mock_host + "api/", () => {
        return HttpResponse.json({ post_request: true });
    }),
];
