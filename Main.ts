import {Server} from "./Server";
import {ServerApi} from "./ServerApi";

export class ServerMain {
    constructor() {
        console.log("server main done");

        const api = new ServerApi();
        new Server(api);
    }
}

new ServerMain();