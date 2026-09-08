import {WebSocket} from "ws";

export class Player {
    public name: string;
    public socket: WebSocket;

    constructor(name: string, socket: WebSocket) {
        this.name = name;
        this.socket = socket;
    }
}