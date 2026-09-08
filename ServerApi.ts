import {WebSocketServer} from "ws";
import type {DataParser} from "./DataParser.ts";

export class ServerApi {
    private server: WebSocketServer;

    constructor() {
        this.server = new WebSocketServer({
            //port: Number(process.env.PORT)
            port: 3001
        });

        console.log("server api is ready");
    }

    public onMessage(callback: (message: DataParser | string, socket: WebSocketServer) => void) {
        this.server.on("connection", socket => {
            socket.on("message", (data) => {
                const message: DataParser = JSON.parse(data.toString());
                callback(message, socket);
            });

            socket.on("close", (data) => {
                callback(data.toString(), socket);
            });
        });
    }
}