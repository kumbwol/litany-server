import {WebSocket} from "ws";
import {ItemCard} from "./card/ItemCard";

export class Player {
    public name: string;
    public socket: WebSocket;
    public hand: ItemCard[] = [];

    constructor(name: string, socket: WebSocket) {
        this.name = name;
        this.socket = socket;
    }
}