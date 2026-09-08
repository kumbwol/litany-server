import {Player} from "./Player";
import {WebSocket} from "ws";

export class Room {
    private players = new Map<string, Player>();

    constructor() {

    }

    public removePlayer(socket: WebSocket) {
        this.players.forEach((player: Player, key: string) => {
            if(player.socket === socket) {
                this.players.delete(key);
            }
        });
    }

    public getPlayers() {
        return this.players;
    }

    public addPlayer(playerName: string, socket: WebSocket) {
        if(!this.players.has(playerName) && this.players.size < 2) {
            this.players.set(playerName, new Player(playerName, socket));
        }
    }
}