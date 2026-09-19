import {ServerApi} from "./ServerApi";
import {ClientDataParser, ServerDataParser, ServerMessageType} from "./DataParser";
import {ClientMessageType} from "./DataParser";
import {WebSocket} from "ws";
import {Room} from "./Room";
import {Player} from "./Player";
import {LamentCard} from "./card/LamentCard";

export class Server {
    private room = new Map<string, Room>();

    constructor(api: ServerApi) {
        api.onMessage((message: ClientDataParser, socket: WebSocket) => {
            switch (message.type) {
                case ClientMessageType.ENTER:
                    if(!this.room.has(message.roomId)) {
                        this.room.set(message.roomId, new Room());
                    }

                    this.room.get(message.roomId)!.addPlayer(message.playerName, socket);
                    break;

                case ClientMessageType.PLAY_CARD:
                    this.room.get(message.roomId)!.getPlayer(message.playerName).removeCardFromHand();

                    const data: ServerDataParser = {
                        type: ServerMessageType.OPPONENT_PLAYED_CARD,
                        opponentHand: this.room.get(message.roomId)!.getPlayer(message.playerName)!.hand,
                        resource: message.resource,
                        itemType: message.itemType
                    };
                    this.room.get(message.roomId)!.getOpponent(message.playerName)!.socket.send(JSON.stringify(data));
                    break;

                case ClientMessageType.LAMENT_DRAFT_PLAYER_ACTION:
                    this.room.get(message.roomId)!.removeCardsFromLamentDeck(message.pickCardType, message.discardCardType);
                    this.room.get(message.roomId)!.getPlayer(message.playerName).addCardToHand(new LamentCard(message.pickCardType));
                    this.room.get(message.roomId)!.swapPlayerTurn();

                    if(this.room.get(message.roomId)!.getLamentDeck().length === 0) {
                        const lamentEndDataPlayer1: ServerDataParser = {
                            type: ServerMessageType.LAMENT_DRAFT_END,
                            playerHand: this.room.get(message.roomId)!.getPlayer(message.playerName)!.hand,
                            opponentHand: this.room.get(message.roomId)!.getObfuscatedOpponentCards(this.room.get(message.roomId)!.getOpponent(message.playerName)!),
                        };
                        const lamentEndDataPlayer2: ServerDataParser = {
                            type: ServerMessageType.LAMENT_DRAFT_END,
                            playerHand: this.room.get(message.roomId)!.getOpponent(message.playerName)!.hand,
                            opponentHand: this.room.get(message.roomId)!.getObfuscatedOpponentCards(this.room.get(message.roomId)!.getPlayer(message.playerName)!),
                        };

                        this.room.get(message.roomId)!.getPlayer(message.playerName)!.socket.send(JSON.stringify(lamentEndDataPlayer1));
                        this.room.get(message.roomId)!.getOpponent(message.playerName)!.socket.send(JSON.stringify(lamentEndDataPlayer2));
                    } else {
                        const lamentData: ServerDataParser = {
                            type: ServerMessageType.LAMENT_DRAFT_SERVER_ACTION,
                            lamentDraftCards: this.room.get(message.roomId)!.getLamentDeck(),
                        };
                        this.room.get(message.roomId)!.getOpponent(message.playerName)!.socket.send(JSON.stringify(lamentData));
                    }
                    break;

                case ClientMessageType.PLAYER_INITIATIVE_ACTION:
                    console.log("isPlay:", message.isPlayActionRequested);
                    this.room.get(message.roomId)!.getPlayer(message.playerName).willDoAction = message.isPlayActionRequested;

                    if(this.room.get(message.roomId)!.getPlayer(message.playerName).willDoAction === undefined || this.room.get(message.roomId)!.getOpponent(message.playerName)!.willDoAction === undefined) {
                        return;
                    }

                    const isPlayerTookAction = this.room.get(message.roomId)!.getPlayer(message.playerName).willDoAction === true;
                    const isOpponentTookAction = this.room.get(message.roomId)!.getOpponent(message.playerName)!.willDoAction === true;

                    console.log(isPlayerTookAction, isOpponentTookAction)

                    if(!isOpponentTookAction && !isPlayerTookAction) {
                        const actionsFinishedData: ServerDataParser = {
                            type: ServerMessageType.PLAYER_ACTIONS_FINISHED,
                        };

                        this.room.get(message.roomId)!.getPlayer(message.playerName).willDoAction = undefined;
                        this.room.get(message.roomId)!.getOpponent(message.playerName)!.willDoAction = undefined;

                        this.room.get(message.roomId)!.getPlayer(message.playerName)!.socket.send(JSON.stringify(actionsFinishedData));
                        this.room.get(message.roomId)!.getOpponent(message.playerName)!.socket.send(JSON.stringify(actionsFinishedData));
                    }

                    if((isPlayerTookAction && !isOpponentTookAction) || (!isPlayerTookAction && isOpponentTookAction)) {

                        const playerTakesAction: ServerDataParser = {
                            type: ServerMessageType.PLAYER_TAKES_ACTIONS,
                        };

                        const playerWaits: ServerDataParser = {
                            type: ServerMessageType.PLAYER_WAITS,
                        };

                        this.room.get(message.roomId)!.getPlayer(message.playerName).willDoAction = undefined;
                        this.room.get(message.roomId)!.getOpponent(message.playerName)!.willDoAction = undefined;

                        this.room.get(message.roomId)!.getPlayer(message.playerName)!.socket.send(JSON.stringify(isPlayerTookAction ? playerTakesAction : playerWaits));
                        this.room.get(message.roomId)!.getOpponent(message.playerName)!.socket.send(JSON.stringify(isPlayerTookAction ? playerWaits : playerTakesAction));
                    }
                    break;

                case ClientMessageType.CLOSE:
                    this.room.forEach((room: Room) => {
                        room.removePlayer(socket);
                    });
                    break;
            }

            console.log("--------");
            this.room.forEach((room: Room) => {
                console.log("kakasz22", room.getPlayers().size);
                //console.log(room.getPlayers());
            });
        });

        console.log("server is ready");
    }
}