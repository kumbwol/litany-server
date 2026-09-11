import {WebSocket} from "ws";
import {ItemCard} from "./card/ItemCard";
import {LamentCard} from "./card/LamentCard";

export class Player {
    public name: string;
    public socket: WebSocket;
    public hand: (ItemCard | LamentCard)[] = [];
    public isFirstPlayer: boolean = false;

    constructor(name: string, socket: WebSocket) {
        this.name = name;
        this.socket = socket;
    }

    public addCardToHand(pickedLamentCard: LamentCard) {
        this.hand.push(pickedLamentCard);
    }

    public removeCardFromHand() {
        this.hand.pop();
    }
}