import {WebSocket} from "ws";
import {ItemCard} from "./card/ItemCard";
import {LamentCard} from "./card/LamentCard";
import {CardTypes} from "./card/CardTypes";

export class Player {
    public name: string;
    public socket: WebSocket;
    public hand: (ItemCard | LamentCard)[] = [];
    public isFirstPlayer: boolean = false;
    public willDoAction: boolean | undefined = undefined;
    public hasInitiative: boolean = false;

    constructor(name: string, socket: WebSocket) {
        this.name = name;
        this.socket = socket;
    }

    public addCardToHand(pickedLamentCard: LamentCard) {
        this.hand.push(pickedLamentCard);
    }

    public removeCardFromHand() {
        for(let i = this.hand.length - 1; i >= 0; i--) {
            if(this.hand[i].type === CardTypes.ITEM) {
                this.hand.splice(i, 1);
                break;
            }
        }
    }
}