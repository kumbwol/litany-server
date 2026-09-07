import {Server} from "./Server.ts";
import {ServerApi} from "./ServerApi.ts";

export class ServerMain {
    constructor() {
        console.log("server main done");

        const api = new ServerApi();
        new Server(api);
    }
}

new ServerMain();