import {ServerApi} from "./ServerApi";
import {ClientDataParser, ServerDataParser, ServerMessageType} from "./DataParser";
import {ClientMessageType} from "./DataParser";
import {WebSocket} from "ws";
import {Room} from "./Room";
import {Player} from "./Player";
import {LamentCard} from "./card/LamentCard";
import {ItemCard} from "./card/ItemCard";

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

                case ClientMessageType.DESTROY_CARD:
                    const destroyData: ServerDataParser = {
                        type: ServerMessageType.OPPONENT_DESTROYED_CARD,
                        index: message.index
                    };
                    this.room.get(message.roomId)!.putBackDestroyedCardToDeck(message.itemType);
                    this.room.get(message.roomId)!.getOpponent(message.playerName)!.socket.send(JSON.stringify(destroyData));
                    break;

                case ClientMessageType.COLLECT_RESOURCES:
                    const collectData: ServerDataParser = {
                        type: ServerMessageType.OPPONENT_COLLECTED_RESOURCES,
                        resource: message.resource,
                    };
                    this.room.get(message.roomId)!.getOpponent(message.playerName)!.socket.send(JSON.stringify(collectData));
                    break;

                case ClientMessageType.PASS_TURN:
                    this.room.get(message.roomId)!.getPlayer(message.playerName).willDoAction = undefined;

                    if(this.room.get(message.roomId)!.getOpponent(message.playerName)!.willDoAction) {
                        const playerWhoTookAction = this.room.get(message.roomId)!.getOpponent(message.playerName)!;
                        const playerWhoWaits = this.room.get(message.roomId)!.getPlayer(message.playerName);

                        const hasActivePlayerMatchingLament = this.room.get(message.roomId)!.hasPlayerMatchingLamentCardWithDivinity(playerWhoTookAction);

                        const card = (hasActivePlayerMatchingLament ? this.room.get(message.roomId)!.getItemDeck().pop()! : undefined);

                        if(hasActivePlayerMatchingLament) {
                            playerWhoTookAction.hand.push(card as ItemCard);
                        }

                        const playerTakesAction: ServerDataParser = {
                            type: ServerMessageType.PLAYER_TAKES_ACTIONS,
                            hasInitiative: false,
                            lamentDraw: card,
                            lamentResources: hasActivePlayerMatchingLament ? 3 : 0,
                        };

                        const playerWaits: ServerDataParser = {
                            type: ServerMessageType.PLAYER_WAITS,
                            hasInitiative: true,
                            opponentHand: this.room.get(message.roomId)!.getObfuscatedOpponentCards(playerWhoTookAction),
                            opponentResources: hasActivePlayerMatchingLament ? 3 : 0
                        };

                        this.room.get(message.roomId)!.getPlayer(message.playerName).willDoAction = undefined;
                        this.room.get(message.roomId)!.getOpponent(message.playerName)!.willDoAction = undefined;

                        this.room.get(message.roomId)!.getPlayer(message.playerName)!.socket.send(JSON.stringify(playerWaits));
                        this.room.get(message.roomId)!.getOpponent(message.playerName)!.socket.send(JSON.stringify(playerTakesAction));
                    } else {
                        this.room.get(message.roomId)!.getPlayer(message.playerName).willDoAction = undefined;
                        this.room.get(message.roomId)!.getOpponent(message.playerName)!.willDoAction = undefined;

                        if(this.room.get(message.roomId)!.shouldLamentDraftStart()) {
                            this.room.get(message.roomId)!.getPlayer(message.playerName)!.removeLamentCardsFromHand();
                            this.room.get(message.roomId)!.getOpponent(message.playerName)!.removeLamentCardsFromHand();
                            this.room.get(message.roomId)!.shuffleLamentCards();
                            this.room.get(message.roomId)!.getLamentDeck().pop();

                            const playerHasInitiative = this.room.get(message.roomId)!.getPlayer(message.playerName)!.hasInitiative;
                            const playerWithInitiative = playerHasInitiative ? this.room.get(message.roomId)!.getPlayer(message.playerName)! : this.room.get(message.roomId)!.getOpponent(message.playerName)!;
                            const playerWithPassive = !playerHasInitiative ? this.room.get(message.roomId)!.getPlayer(message.playerName)! : this.room.get(message.roomId)!.getOpponent(message.playerName)!;

                            const newLamentDraftInitiative: ServerDataParser = {
                                type: ServerMessageType.NEW_LAMENT_DRAFT,
                                lamentDraftCards: this.room.get(message.roomId)!.getLamentDeck(),
                                playerHand: playerWithInitiative.hand,
                                opponentHand: this.room.get(message.roomId)!.getObfuscatedOpponentCards(playerWithPassive),
                            };

                            const newLamentDraftPassive: ServerDataParser = {
                                type: ServerMessageType.NEW_LAMENT_DRAFT,
                                lamentDraftCards: this.room.get(message.roomId)!.getObfuscatedCards(this.room.get(message.roomId)!.getLamentDeck()) as LamentCard[],
                                playerHand: playerWithPassive.hand,
                                opponentHand: this.room.get(message.roomId)!.getObfuscatedOpponentCards(playerWithInitiative),
                            };

                            this.room.get(message.roomId)!.getPlayer(message.playerName)!.socket.send(JSON.stringify(playerHasInitiative ? newLamentDraftInitiative : newLamentDraftPassive));
                            this.room.get(message.roomId)!.getOpponent(message.playerName)!.socket.send(JSON.stringify(playerHasInitiative ? newLamentDraftPassive : newLamentDraftInitiative));
                        } else {
                            const actionsFinishedData: ServerDataParser = {
                                type: ServerMessageType.PLAYER_ACTIONS_FINISHED,
                            };

                            this.room.get(message.roomId)!.getPlayer(message.playerName)!.socket.send(JSON.stringify(actionsFinishedData));
                            this.room.get(message.roomId)!.getOpponent(message.playerName)!.socket.send(JSON.stringify(actionsFinishedData));
                        }
                    }
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
                        this.room.get(message.roomId)!.getPlayer(message.playerName).willDoAction = undefined;
                        this.room.get(message.roomId)!.getOpponent(message.playerName)!.willDoAction = undefined;

                        if(this.room.get(message.roomId)!.shouldLamentDraftStart()) {
                            this.room.get(message.roomId)!.getPlayer(message.playerName)!.removeLamentCardsFromHand();
                            this.room.get(message.roomId)!.getOpponent(message.playerName)!.removeLamentCardsFromHand();
                            this.room.get(message.roomId)!.shuffleLamentCards();
                            this.room.get(message.roomId)!.getLamentDeck().pop();

                            const playerHasInitiative = this.room.get(message.roomId)!.getPlayer(message.playerName)!.hasInitiative;
                            const playerWithInitiative = playerHasInitiative ? this.room.get(message.roomId)!.getPlayer(message.playerName)! : this.room.get(message.roomId)!.getOpponent(message.playerName)!;
                            const playerWithPassive = !playerHasInitiative ? this.room.get(message.roomId)!.getPlayer(message.playerName)! : this.room.get(message.roomId)!.getOpponent(message.playerName)!;

                            const newLamentDraftInitiative: ServerDataParser = {
                                type: ServerMessageType.NEW_LAMENT_DRAFT,
                                lamentDraftCards: this.room.get(message.roomId)!.getLamentDeck(),
                                playerHand: playerWithInitiative.hand,
                                opponentHand: this.room.get(message.roomId)!.getObfuscatedOpponentCards(playerWithPassive),
                            };

                            const newLamentDraftPassive: ServerDataParser = {
                                type: ServerMessageType.NEW_LAMENT_DRAFT,
                                lamentDraftCards: this.room.get(message.roomId)!.getObfuscatedCards(this.room.get(message.roomId)!.getLamentDeck()) as LamentCard[],
                                playerHand: playerWithPassive.hand,
                                opponentHand: this.room.get(message.roomId)!.getObfuscatedOpponentCards(playerWithInitiative),
                            };

                            this.room.get(message.roomId)!.getPlayer(message.playerName)!.socket.send(JSON.stringify(playerHasInitiative ? newLamentDraftInitiative : newLamentDraftPassive));
                            this.room.get(message.roomId)!.getOpponent(message.playerName)!.socket.send(JSON.stringify(playerHasInitiative ? newLamentDraftPassive : newLamentDraftInitiative));
                        } else {
                            const actionsFinishedData: ServerDataParser = {
                                type: ServerMessageType.PLAYER_ACTIONS_FINISHED,
                            };

                            this.room.get(message.roomId)!.getPlayer(message.playerName)!.socket.send(JSON.stringify(actionsFinishedData));
                            this.room.get(message.roomId)!.getOpponent(message.playerName)!.socket.send(JSON.stringify(actionsFinishedData));
                        }
                    }

                    if((isPlayerTookAction && !isOpponentTookAction) || (!isPlayerTookAction && isOpponentTookAction)) {
                        this.room.get(message.roomId)!.getPlayer(message.playerName).hasInitiative = isPlayerTookAction;
                        this.room.get(message.roomId)!.getOpponent(message.playerName)!.hasInitiative = isOpponentTookAction;

                        const playerWhoTookAction = isPlayerTookAction ? this.room.get(message.roomId)!.getPlayer(message.playerName) : this.room.get(message.roomId)!.getOpponent(message.playerName)!;
                        const playerWhoWaits = !isPlayerTookAction ? this.room.get(message.roomId)!.getPlayer(message.playerName) : this.room.get(message.roomId)!.getOpponent(message.playerName)!;

                        const hasActivePlayerMatchingLament = this.room.get(message.roomId)!.hasPlayerMatchingLamentCardWithDivinity(playerWhoTookAction);

                        const card = (hasActivePlayerMatchingLament ? this.room.get(message.roomId)!.getItemDeck().pop()! : undefined);

                        if(hasActivePlayerMatchingLament) {
                            playerWhoTookAction.hand.push(card as ItemCard);
                        }

                        const playerTakesAction: ServerDataParser = {
                            type: ServerMessageType.PLAYER_TAKES_ACTIONS,
                            hasInitiative: true,
                            lamentDraw: card,
                            lamentResources: hasActivePlayerMatchingLament ? 3 : 0,
                        };

                        const playerWaits: ServerDataParser = {
                            type: ServerMessageType.PLAYER_WAITS,
                            hasInitiative: false,
                            opponentHand: this.room.get(message.roomId)!.getObfuscatedOpponentCards(playerWhoTookAction),
                            opponentResources: hasActivePlayerMatchingLament ? 3 : 0
                        };

                        this.room.get(message.roomId)!.getPlayer(message.playerName).willDoAction = undefined;
                        this.room.get(message.roomId)!.getOpponent(message.playerName)!.willDoAction = undefined;

                        this.room.get(message.roomId)!.getPlayer(message.playerName)!.socket.send(JSON.stringify(isPlayerTookAction ? playerTakesAction : playerWaits));
                        this.room.get(message.roomId)!.getOpponent(message.playerName)!.socket.send(JSON.stringify(isPlayerTookAction ? playerWaits : playerTakesAction));
                    }

                    if(isPlayerTookAction && isOpponentTookAction) {
                        const isPlayerHasInitiative = this.room.get(message.roomId)!.getPlayer(message.playerName).hasInitiative;

                        const playerWhoTookAction = isPlayerHasInitiative ? this.room.get(message.roomId)!.getPlayer(message.playerName) : this.room.get(message.roomId)!.getOpponent(message.playerName)!;
                        const playerWhoWaits = !isPlayerHasInitiative ? this.room.get(message.roomId)!.getPlayer(message.playerName) : this.room.get(message.roomId)!.getOpponent(message.playerName)!;

                        const hasActivePlayerMatchingLament = this.room.get(message.roomId)!.hasPlayerMatchingLamentCardWithDivinity(playerWhoTookAction);

                        const card = (hasActivePlayerMatchingLament ? this.room.get(message.roomId)!.getItemDeck().pop()! : undefined);

                        if(hasActivePlayerMatchingLament) {
                            playerWhoTookAction.hand.push(card as ItemCard);
                        }

                        const playerTakesAction: ServerDataParser = {
                            type: ServerMessageType.PLAYER_TAKES_ACTIONS,
                            hasInitiative: true,
                            lamentDraw: card,
                            lamentResources: hasActivePlayerMatchingLament ? 3 : 0,
                        };

                        const playerWaits: ServerDataParser = {
                            type: ServerMessageType.PLAYER_WAITS,
                            hasInitiative: false,
                            opponentHand: this.room.get(message.roomId)!.getObfuscatedOpponentCards(playerWhoTookAction),
                            opponentResources: hasActivePlayerMatchingLament ? 3 : 0
                        };

                        this.room.get(message.roomId)!.getPlayer(message.playerName).willDoAction = true;
                        this.room.get(message.roomId)!.getOpponent(message.playerName)!.willDoAction = true;

                        this.room.get(message.roomId)!.getPlayer(message.playerName)!.socket.send(JSON.stringify(isPlayerHasInitiative ? playerTakesAction : playerWaits));
                        this.room.get(message.roomId)!.getOpponent(message.playerName)!.socket.send(JSON.stringify(!isPlayerHasInitiative ? playerTakesAction : playerWaits));
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