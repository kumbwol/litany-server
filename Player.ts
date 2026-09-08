import {WebSocket} from "ws";
import {Card} from "./card/Card";

export class Player {
    public name: string;
    public socket: WebSocket;
    public hand: Card[] = [];

    constructor(name: string, socket: WebSocket) {
        this.name = name;
        this.socket = socket;
    }
}