import {ItemCard} from "./card/ItemCard";

export enum ClientMessageType {
    ENTER,
    CLOSE
}

export enum ServerMessageType {
    INIT = "INIT",
}

export type ClientDataParser =
    | { type: ClientMessageType.ENTER, roomId: string; playerName: string; }
    | { type: ClientMessageType.CLOSE; }

export type ServerDataParser =
    | { type: ServerMessageType.INIT, playerHand: ItemCard[]; opponentHand: ItemCard[]; }