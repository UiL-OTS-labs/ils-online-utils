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

export { isActive, start, upload, subjectId, _clearGlobalState };

// ToDo: Remove Store this in a Session instance see issue #10
let session_id: string | null = null;
var subject_id: string | null = null;

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
    api.sessionStart(access_key).then((data: any) => {
        session_id = data.uuid;
        subject_id = data.subject_id;
        callback(data.group_name);
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
function upload(access_key: string, data: string): Promise<Object> {
    let api = new API(resolveServer());
    if (session_id === null) {
        throw new Error("No active session!");
    }

    return api.sessionUpload(access_key, session_id, data);
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
