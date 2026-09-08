import {ServerApi} from "./ServerApi.ts";
import type {DataParser} from "./DataParser";
import {Player} from "./Player.ts";
import {WebSocketServer} from "ws";

export class Server {
    private players = new Map<string, Player>();

    constructor(api: ServerApi) {
        api.onMessage((message: DataParser | string, socket: WebSocketServer) => {
            if(message === "1001") {
                for(let key of this.players.keys()) {
                    if(this.players.get(key).socket === socket) {
                        this.players.delete(key);
                    }
                }
            } else {
                const playerName = message.playerName;
                if(!this.players.has(message)) {
                    this.players.set(playerName, new Player(playerName, socket));
                }
            }

            console.log("--------");
            this.players.forEach((player: Player) => {
                console.log(player.name);
            });
        });

        console.log("server is ready");
    }
}