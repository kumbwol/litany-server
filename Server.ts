import {ServerApi} from "./ServerApi";
import {ClientDataParser, ServerDataParser, ServerMessageType} from "./DataParser";
import {ClientMessageType} from "./DataParser";
import {WebSocket} from "ws";
import {Room} from "./Room";
import {Player} from "./Player";

export class Server {
    private room = new Map<string, Room>();

    constructor(api: ServerApi) {
        api.onMessage((message: ClientDataParser, socket: WebSocket) => {
            switch (message.type) {
                case ClientMessageType.ENTER:
                    if(!this.room.has(message.roomId)) {
                        this.room.set(message.roomId, new Room());
                    }

                    this.room.get(message.roomId)!.addPlayer(message.playerName, socket);
                    break;

                case ClientMessageType.PLAY_CARD:
                    this.room.get(message.roomId)!.getPlayer(message.playerName).removeCardFromHand();

                    const data: ServerDataParser = {
                        type: ServerMessageType.CHANGE_OPPONENT_HAND,
                        opponentHand: this.room.get(message.roomId)!.getPlayer(message.playerName)!.hand,
                    };
                    this.room.get(message.roomId)!.getOpponent(message.playerName)!.socket.send(JSON.stringify(data));
                    break;

                case ClientMessageType.CLOSE:
                    this.room.forEach((room: Room) => {
                        room.removePlayer(socket);
                    });
                    break;
            }

            console.log("--------");
            this.room.forEach((room: Room) => {
                console.log("kakasz22", room.getPlayers().size);
                //console.log(room.getPlayers());
            });
        });

        console.log("server is ready");
    }
}