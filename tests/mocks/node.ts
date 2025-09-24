import { setupServer } from "msw/node";
import { handlers } from "./rest-handler";

export const server = setupServer(...handlers);
