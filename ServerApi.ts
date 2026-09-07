import {WebSocketServer} from "ws";

export class ServerApi {
    private server: WebSocketServer;

    constructor() {
        this.server = new WebSocketServer({
            port: 3001
        });

        console.log("server api is ready");
    }

    public onMessage(callback: (message: string) => void) {
        this.server.on("connection", socket => {
            console.log("client connected");

            socket.on("message", data => {
                callback(data.toString());
            });
        });
    }
}