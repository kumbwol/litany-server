import {Card} from "./Card";
import {CardTypes, DivinityTypes} from "./CardTypes";

export class DivinityCard extends Card {
    constructor(public divinityType: DivinityTypes = DivinityTypes.UNKNOWN) {
        super(CardTypes.DIVINITY);
    }
}