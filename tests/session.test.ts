// import {reimport} from "./support/reimport.mjs";

import {expect, describe, it, beforeEach, vi, Mock} from 'vitest';
import * as session from '../src/session';

// Mock fetch to provide instrumented Responses
let fetch: Mock = vi.fn()

function mockFetch<T>(json: T, status:number = 200) {
    let response = new Response(JSON.stringify(json), {status: status});
    fetch.mockReturnValueOnce (
        Promise.resolve (
            new Response(JSON.stringify(json), {status: status})
        )
    );
}

// The fetch will return this as a default value
function mockFetchDefault<T>(json: T, status:number = 200) {
    let response = new Response(JSON.stringify(json), {status: status});
    fetch.mockReturnValue(
        Promise.resolve (
            new Response(JSON.stringify(json), {status: status})
        )
    );
}


describe('session api', () => {
    // beforeEach(async () => {session = await reimport('../jspsych-uil-session.js');});
    beforeEach(() => {
        vi.clearAllMocks();
        session._clearGlobalState();
    });

    const key = '01e6506c-8538-4f83-bb3f-f7cf2ba7f63f';
    const session_uuid = 'b76ed785-2b90-4d0a-9c88-47ae917d3d6e'

    it('should start a session', (done) => {
        const mock_response = {
             group_name: 'A',
             subject_id: 'xyz',
             uuid: session_uuid
        };

        mockFetch(mock_response, 200);

        session.start(key, (group_name) => {
            expect(group_name).toBe('A');
            expect(session.isActive()).toBeTruthy();
            expect(session.subjectId()).toBe('xyz');
        });
    });

    it('should upload results', (done) => {
        const mock_session = {
            group_name: 'A',
            subject_id: 'xyz',
            uuid: 'test_session_id'
        };
        const empty_response = JSON.stringify({})
        const status = {status:200};

        mockFetch(mock_session);
        mockFetch(empty_response);

        session.start(key, (group_name) => {
            expect(group_name).toBe('A');
            expect(session.isActive()).toBeTruthy()
            expect(session.subjectId()).toBe('xyz');
            expect(() =>
                {
                    session.upload(key, {test_data: 1});
                }).not.toThrow();
        });

    });

    it('reports inactive session when not started', () => {
        expect(session.isActive()).toBeFalsy()
    });

//
//    it('should not fail silently', (done) => {
//        mockFetch({}, 400);
//        expect(async () => {
//            await new Promise((resolve) => session.start(key, resolve));
//        }).toThrow();
//    });

    it('fails to upload without a session', async () => {
        mockFetch({}, 200);
        expect(() => {session.upload(key, {})}).toThrow();
    });
});
