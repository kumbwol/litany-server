import {Card} from "./Card";
import {CardTypes, LamentTypes} from "./CardTypes";

export class LamentCard extends Card {
    constructor(public lamentType: LamentTypes = LamentTypes.UNKNOWN) {
        super(CardTypes.LAMENT);
    }
}