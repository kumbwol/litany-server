import {ServerApi} from "./ServerApi";
import type {ClientDataParser} from "./DataParser.ts";
import {ClientMessageType} from "./DataParser";
import {WebSocket} from "ws";
import {Room} from "./Room";

export class Server {
    private room = new Map<string, Room>();

    constructor(api: ServerApi) {
        api.onMessage((message: ClientDataParser, socket: WebSocket) => {
            switch (message.type) {
                case ClientMessageType.ENTER:
                    const roomId = message.roomId;
                    const playerName = message.playerName;

                    if(!this.room.has(roomId)) {
                        this.room.set(roomId, new Room());
                    }

                    this.room.get(roomId)!.addPlayer(playerName, socket);
                    break;

                case ClientMessageType.CLOSE:
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