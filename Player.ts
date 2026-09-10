import {WebSocket} from "ws";
import {ItemCard} from "./card/ItemCard";
import {LamentCard} from "./card/LamentCard";

export class Player {
    public name: string;
    public socket: WebSocket;
    public hand: (ItemCard | LamentCard)[] = [];

    constructor(name: string, socket: WebSocket) {
        this.name = name;
        this.socket = socket;
    }

    public removeCardFromHand() {
        this.hand.pop();
    }
}