import { http, HttpResponse } from "msw";
import { MetaData, ParticipantSessionData } from "../../src/network";

export const mock_host = "https://mock-rest-domain.com";
export const mock_access_key = "mock_access_key";
export const mock_meta_data: MetaData = {
    state: "Open",
};
export const mock_session: ParticipantSessionData = {
    uuid: "some-uuid",
    group: "some-group",
    subject_id: -1,
    state: 1,
};

export const handlers = [
    http.get(`${mock_host}/api/${mock_access_key}/`, () => {
        const meta: MetaData = mock_meta_data;
        return HttpResponse.json(meta);
    }),
    http.post(`${mock_host}/api/${mock_access_key}/participant/`, () => {
        const session: ParticipantSessionData = mock_session;
        return HttpResponse.json(session);
    }),
    http.post<{ id: string }>(
        `${mock_host}/api/${mock_access_key}/upload/:id/`,
        async ({ request, params }) => {
            const { id } = params;
            if (id != "some-uuid") {
                return new HttpResponse(null, { status: 404 });
            }
            let response = await request.text();
            if (response != "some-data") {
                return new HttpResponse(null, { status: 400 });
            }
            return HttpResponse.json({ upload: "ok" });
        },
    ),
];
