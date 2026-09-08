import {Player} from "./Player";
import {WebSocket} from "ws";

export class Room {
    private players = new Map<string, Player>();

    constructor() {

    }

    public getPlayers() {
        return this.players;
    }

    public addPlayer(playerName: string, socket: WebSocket) {
        if(!this.players.has(playerName)) {
            this.players.set(playerName, new Player(playerName, socket));
        }
    }
}