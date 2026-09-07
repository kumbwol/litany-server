import {ServerApi} from "./ServerApi.ts";

export class Server {
    constructor(api: ServerApi) {
        api.onMessage(message => {
            console.log("Server received:", message);
        });

        console.log("server is ready");
    }
}