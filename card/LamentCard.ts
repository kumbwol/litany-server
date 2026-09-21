import {Card} from "./Card";
import {CardTypes, DivinityTypes, LamentTypes} from "./CardTypes";

export class LamentCard extends Card {
    public divinityType: DivinityTypes = DivinityTypes.UNKNOWN;

    constructor(public lamentType: LamentTypes = LamentTypes.UNKNOWN) {
        super(CardTypes.LAMENT);

        switch (lamentType) {
            case LamentTypes.UNKNOWN:
                break;

            case LamentTypes.CHOICE:
                this.divinityType = DivinityTypes.FREEDOM;
                break;

            case LamentTypes.DOMINION:
                this.divinityType = DivinityTypes.SUBJECTION;
                break;

            case LamentTypes.FAITH:
                this.divinityType = DivinityTypes.JOKER;
                break;

            case LamentTypes.IGNORANCE:
                this.divinityType = DivinityTypes.KNOWLEDGE;
                break;

            case LamentTypes.INTERFERENCE:
                this.divinityType = DivinityTypes.JOKER;
                break;

            case LamentTypes.LOSS:
                this.divinityType = DivinityTypes.STRENGTH;
                break;

            case LamentTypes.REVENGE:
                this.divinityType = DivinityTypes.SCHEMES;
                break;

            case LamentTypes.SOLITUDE:
                this.divinityType = DivinityTypes.WISDOM;
                break;
        }
    }
}