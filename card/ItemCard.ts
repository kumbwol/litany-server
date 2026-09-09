import {Card} from "./Card";
import {CardTypes, ItemTypes} from "./CardTypes";

export class ItemCard extends Card {
    constructor(public itemType: ItemTypes = ItemTypes.UNKNOWN) {
        super(CardTypes.ITEM);
    }
}