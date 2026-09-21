import {WebSocketServer, WebSocket} from "ws";
import type {ClientDataParser} from "./DataParser.ts";
import {ClientMessageType} from "./DataParser";

export class ServerApi {
    private server: WebSocketServer;

    constructor() {
        this.server = new WebSocketServer({
            port: Number(process.env.PORT)
            //port: 3001
        });

        console.log("server api is ready");
    }

    public onMessage(callback: (message: ClientDataParser, socket: WebSocket) => void) {
        this.server.on("connection", (socket: WebSocket) => {
            socket.on("message", (data: string) => {
                const parsedData: ClientDataParser = JSON.parse(data);
                callback(parsedData, socket);
            });

            socket.on("close", (data: string) => {
                const type = ClientMessageType.CLOSE;
                const message: ClientDataParser = {type};
                callback(message, socket);
            });
        });
    }
}