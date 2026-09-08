import {ServerApi} from "./ServerApi";
import type {DataParser} from "./DataParser.ts";
import {MessageType} from "./DataParser";
import {WebSocket} from "ws";
import {Room} from "./Room";

export class Server {
    private room = new Map<string, Room>();

    constructor(api: ServerApi) {
        api.onMessage((message: DataParser, socket: WebSocket) => {
            switch (message.type) {
                case MessageType.ENTER:
                    const roomId = message.roomId;
                    const playerName = message.playerName;

                    if(!this.room.has(roomId)) {
                        this.room.set(roomId, new Room());
                    }

                    this.room.get(roomId)!.addPlayer(playerName, socket);
                    break;

                case MessageType.CLOSE:
                    this.room.forEach((room: Room) => {
                        room.removePlayer(socket);
                    });
                    break;
            }

            console.log("--------");
            this.room.forEach((room: Room) => {
                console.log("kakasz22", room.getPlayers().size)
                //console.log(room.getPlayers());
            });
        });

        console.log("server is ready");
    }
}