import {ItemCard} from "./card/ItemCard";
import {LamentCard} from "./card/LamentCard";
import {DivinityCard} from "./card/DivinityCard";
import {ItemTypes, LamentTypes} from "./card/CardTypes";

export enum ClientMessageType {
    ENTER,
    CLOSE,
    PLAY_CARD = "PLAY_CARD",
    DESTROY_CARD = "DESTROY_CARD",
    PASS_TURN = "PASS_TURN",
    COLLECT_RESOURCES = "COLLECT_RESOURCES",
    LAMENT_DRAFT_PLAYER_ACTION = "LAMENT_DRAFT_PLAYER_ACTION",
    PLAYER_INITIATIVE_ACTION = "PLAYER_INITIATIVE_ACTION",
}

export enum ServerMessageType {
    INIT = "INIT",
    CHANGE_OPPONENT_HAND= "CHANGE_OPPONENT_HAND",
    LAMENT_DRAFT_SERVER_ACTION = "LAMENT_DRAFT_SERVER_ACTION",
    LAMENT_DRAFT_END = "LAMENT_DRAFT_END",
    PLAYER_ACTIONS_FINISHED = "PLAYER_ACTIONS_FINISHED",
    PLAYER_TAKES_ACTIONS = "PLAYER_TAKES_ACTIONS",
    PLAYER_WAITS = "PLAYER_WAITS",
    OPPONENT_PLAYED_CARD = "OPPONENT_PLAYED_CARD",
    OPPONENT_DESTROYED_CARD = "OPPONENT_DESTROYED_CARD",
    OPPONENT_COLLECTED_RESOURCES = "OPPONENT_COLLECTED_RESOURCES",
}

type PlayerContext = {
    roomId: string;
    playerName: string;
};

export type ClientDataParser =
    | ({ type: ClientMessageType.ENTER } & PlayerContext)
    | { type: ClientMessageType.CLOSE }
    | ({ type: ClientMessageType.PLAY_CARD, resource: number, itemType: ItemTypes } & PlayerContext)
    | ({ type: ClientMessageType.DESTROY_CARD, index: number } & PlayerContext)
    | ({ type: ClientMessageType.COLLECT_RESOURCES, resource: number } & PlayerContext)
    | ({ type: ClientMessageType.PASS_TURN } & PlayerContext)
    | ({ type: ClientMessageType.LAMENT_DRAFT_PLAYER_ACTION, pickCardType: LamentTypes, discardCardType: LamentTypes } & PlayerContext)
    | ({ type: ClientMessageType.PLAYER_INITIATIVE_ACTION, isPlayActionRequested: boolean } & PlayerContext)

export type ServerDataParser =
    | { type: ServerMessageType.INIT, playerHand: (ItemCard | LamentCard)[], opponentHand: (ItemCard | LamentCard)[], divinityCards: DivinityCard[], lamentDraftCards: LamentCard[]; }
    | { type: ServerMessageType.CHANGE_OPPONENT_HAND, opponentHand: (ItemCard | LamentCard)[]; }
    | { type: ServerMessageType.LAMENT_DRAFT_SERVER_ACTION, lamentDraftCards: LamentCard[]; }
    | { type: ServerMessageType.LAMENT_DRAFT_END, playerHand: (ItemCard | LamentCard)[], opponentHand: (ItemCard | LamentCard)[]; }
    | { type: ServerMessageType.PLAYER_ACTIONS_FINISHED }
    | { type: ServerMessageType.PLAYER_TAKES_ACTIONS }
    | { type: ServerMessageType.PLAYER_WAITS }
    | { type: ServerMessageType.OPPONENT_PLAYED_CARD, opponentHand: (ItemCard | LamentCard)[], resource: number, itemType: ItemTypes; }
    | { type: ServerMessageType.OPPONENT_DESTROYED_CARD, index: number }
    | { type: ServerMessageType.OPPONENT_COLLECTED_RESOURCES, resource: number }