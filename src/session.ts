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

import { type ParticipantSessionData, type SessionState } from "./dsrestapi";

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
