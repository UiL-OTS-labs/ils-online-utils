/*
 * Session management for UiL-OTS datastore
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

// Try to avoid using resolveServer
import { resolveServer } from "./utils";
import { API } from "./api";
import { type ParticipantSessionData, type SessionState } from "./network";

export { isActive, start, upload, subjectId, _clearGlobalState };

// To do it isn't used so perhaps remove
//
// class NotAParticipantSessionError extends Error {
//     constructor() {
//         super(
//             "Trying to create an ParticipantSession from something that doesn't have the required fields",
//         );
//
//         Object.setPrototypeOf(this, NotAParticipantSessionError.prototype);
//     }
// }

/**
 * A participant session is the confirmation of the server that it knows
 * about a new participant, willing to participant in an experiment.
 */
export class ParticipantSession {
    readonly session_data: ParticipantSessionData;

    private static state_map = new Map<SessionState, string>([
        [1, "Started"],
        [2, "Completed"],
        [3, "Rejected"],
    ]);

    constructor(data: ParticipantSessionData) {
        this.session_data = data;
    }

    get uuid() {
        return this.session_data.uuid;
    }

    get group() {
        return this.session_data.group;
    }
    get subject_id() {
        return this.session_data.subject_id;
    }

    get state() {
        return this.session_data.state;
    }

    get state_string() {
        return ParticipantSession.state_map.get(this.state);
    }
}

// ToDo: Remove Store this in a Session instance see issue #10
let session_id: string | null = null;
var subject_id: string | null = null;
let session: ParticipantSession | null = null;

/**
 * Used to check if a session has already started
 * @returns true when a session has started.
 */
function isActive(): boolean {
    return session_id !== null;
}

/**
 * @callback sessionCallback
 * @param group_name - The name of the target group the participant was assigned to
 */
type SessionCallbackType = (group_name: string) => void;

/**
 * Starts a new participant session on the server
 * @param access_key - Access key for the experiment
 * @param callback - Callback function that receives information about the session
 */
function start(access_key: string, callback: SessionCallbackType) {
    let api = new API(resolveServer());

    // TODO: Make data a Session object here:
    // eg.: .then(session: Session) => etc. see issue #10
    api.startSession(access_key).then((data: ParticipantSession) => {
        session = data;
        callback(session.group);
    });
}

/**
 * Uploads data to the server and finalizes a session
 *
 * @param access_key - Access key for the experiment
 * @param data - Data to be sent to the server, in plain text
 *
 * @returns a promise that contains the parsed JSON returned from the server
 */
function upload(access_key: string, data: string): Promise<void> {
    let api = new API(resolveServer());
    if (session === null) {
        throw new Error("No active session!");
    }

    return api.sessionUpload(access_key, session, data);
}

/**
 * Obtain an subject_id from the the dataserver
 *
 * @returns the subject_id from the data store.
 */
function subjectId(): string {
    if (typeof session_id === "string") {
        return subject_id as string;
    } else {
        throw new Error("No active session");
    }
}

/**
 * clears the global state, this function is mainly to
 * allow the unit tests to pass.
 *
 * In the future
 */
function _clearGlobalState() {
    session_id = null;
    subject_id = null;
}
