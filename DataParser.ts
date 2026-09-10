import {ItemCard} from "./card/ItemCard";
import {LamentCard} from "./card/LamentCard";

export enum ClientMessageType {
    ENTER,
    CLOSE,
    PLAY_CARD = "PLAY_CARD",
}

export enum ServerMessageType {
    INIT = "INIT",
    CHANGE_OPPONENT_HAND= "CHANGE_OPPONENT_HAND",
}

type PlayerContext = {
    roomId: string;
    playerName: string;
};

export type ClientDataParser =
    | ({ type: ClientMessageType.ENTER } & PlayerContext)
    | { type: ClientMessageType.CLOSE }
    | ({ type: ClientMessageType.PLAY_CARD } & PlayerContext);

export type ServerDataParser =
    | { type: ServerMessageType.INIT, playerHand: (ItemCard | LamentCard)[]; opponentHand: (ItemCard | LamentCard)[]; }
    | { type: ServerMessageType.CHANGE_OPPONENT_HAND, opponentHand: (ItemCard | LamentCard)[]; }