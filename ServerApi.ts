import {WebSocketServer, WebSocket} from "ws";
import type {DataParser} from "./DataParser.ts";
import {MessageType} from "./DataParser";

export class ServerApi {
    private server: WebSocketServer;

    constructor() {
        this.server = new WebSocketServer({
            //port: Number(process.env.PORT)
            port: 3001
        });

        console.log("server api is ready");
    }

    public onMessage(callback: (message: DataParser, socket: WebSocket) => void) {
        this.server.on("connection", (socket: WebSocket) => {
            socket.on("message", (data: string) => {
                const type = MessageType.ENTER;
                const parsedData = JSON.parse(data);
                const message: DataParser = {type, roomId: parsedData.roomId, playerName: parsedData.playerName} ;
                callback(message, socket);
            });

            socket.on("close", (data: string) => {
                const type = MessageType.CLOSE;
                const message: DataParser = {type};
                callback(message, socket);
            });
        });
    }
}