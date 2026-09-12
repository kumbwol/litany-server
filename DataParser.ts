import {ItemCard} from "./card/ItemCard";
import {LamentCard} from "./card/LamentCard";
import {DivinityCard} from "./card/DivinityCard";
import {LamentTypes} from "./card/CardTypes";

export enum ClientMessageType {
    ENTER,
    CLOSE,
    PLAY_CARD = "PLAY_CARD",
    LAMENT_DRAFT_PLAYER_ACTION = "LAMENT_DRAFT_PLAYER_ACTION",
    NO_PLAYER_ACTION = "NO_PLAYER_ACTION",
}

export enum ServerMessageType {
    INIT = "INIT",
    CHANGE_OPPONENT_HAND= "CHANGE_OPPONENT_HAND",
    LAMENT_DRAFT_SERVER_ACTION = "LAMENT_DRAFT_SERVER_ACTION",
    LAMENT_DRAFT_END = "LAMENT_DRAFT_END",
    PLAYER_ACTIONS_FINISHED = "PLAYER_ACTIONS_FINISHED",
}

type PlayerContext = {
    roomId: string;
    playerName: string;
};

export type ClientDataParser =
    | ({ type: ClientMessageType.ENTER } & PlayerContext)
    | { type: ClientMessageType.CLOSE }
    | ({ type: ClientMessageType.PLAY_CARD } & PlayerContext)
    | ({ type: ClientMessageType.LAMENT_DRAFT_PLAYER_ACTION, pickCardType: LamentTypes, discardCardType: LamentTypes } & PlayerContext)
    | ({ type: ClientMessageType.NO_PLAYER_ACTION } & PlayerContext);

export type ServerDataParser =
    | { type: ServerMessageType.INIT, playerHand: (ItemCard | LamentCard)[], opponentHand: (ItemCard | LamentCard)[], divinityCards: DivinityCard[], lamentDraftCards: LamentCard[]; }
    | { type: ServerMessageType.CHANGE_OPPONENT_HAND, opponentHand: (ItemCard | LamentCard)[]; }
    | { type: ServerMessageType.LAMENT_DRAFT_SERVER_ACTION, lamentDraftCards: LamentCard[]; }
    | { type: ServerMessageType.LAMENT_DRAFT_END, playerHand: (ItemCard | LamentCard)[], opponentHand: (ItemCard | LamentCard)[]; }
    | { type: ServerMessageType.PLAYER_ACTIONS_FINISHED }