import {CardTypes} from "./CardTypes";

export class Card {
    public type: CardTypes;

    constructor(type: CardTypes) {
        this.type = type;
    }
}