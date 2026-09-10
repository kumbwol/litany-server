import {Player} from "./Player";
import {WebSocket} from "ws";
import {ServerDataParser, ServerMessageType} from "./DataParser";
import {ItemCard} from "./card/ItemCard";
import {LamentCard} from "./card/LamentCard";
import {CardTypes} from "./card/CardTypes";

export class Room {
    private players = new Map<string, Player>();
    private deck: (ItemCard | LamentCard)[] = [];
    private isGameStarted = false;
    private player1: Player | undefined;
    private player2: Player | undefined;

    constructor() {

    }

    public removePlayer(socket: WebSocket) {
        this.players.forEach((player: Player, key: string) => {
            if(player.socket === socket) {
                this.players.delete(key);
            }
        });

        if(this.players.size === 0) {
            this.resetRoom();
        }
    }

    public getPlayers(): Map<string, Player> {
        return this.players;
    }

    public getOpponent(playerName: string): Player | undefined {
        if(this.player1!.name === playerName) {
            return this.player2;
        }
        return this.player1!;
    }

    public getPlayer(playerName: string): Player {
        return this.players.get(playerName)!;
    }

    public addPlayer(playerName: string, socket: WebSocket) {
        if(!this.players.has(playerName) && this.players.size < 2) {
            const player = new Player(playerName, socket);
            if(!this.player1) {
                this.player1 = player;
            } else {
                this.player2 = player;
            }
            this.players.set(playerName, player);
        }

        if(this.players.size === 2 && !this.isGameStarted) {
            console.log("namesssss", this.player1!.name, this.player2!.name);
            this.startGame();
        }
    }

    private resetRoom() {
        this.deck = [];
        this.isGameStarted = false;
        this.player1 = this.player2 = undefined;
    }

    private startGame() {
        this.isGameStarted = true;
        this.createDeck();

        this.drawCards(this.player1!, 5, this.deck);
        this.drawCards(this.player2!, 5, this.deck);

        this.init(this.player1!, this.getObfuscatedOpponentCards(this.player2!));
        this.init(this.player2!, this.getObfuscatedOpponentCards(this.player1!));
    }

    private getObfuscatedOpponentCards(player: Player): (ItemCard | LamentCard)[] {
        const obfuscatedHand = [];
        for(let i=0; i<player.hand.length; i++) {
            if(player.hand[i].type === CardTypes.ITEM) {
                obfuscatedHand.push(new ItemCard());
            } else if(player.hand[i].type === CardTypes.LAMENT) {
                obfuscatedHand.push(new LamentCard());
            }
        }
        return obfuscatedHand;
    }

    private init(player: Player, opponentCards: (ItemCard | LamentCard)[]) {
        const data: ServerDataParser = {
            type: ServerMessageType.INIT,
            playerHand: player.hand,
            opponentHand: opponentCards,
        };
        player.socket.send(JSON.stringify(data));
    }

    private drawCards(player: Player, numberOfCards: number, deck: (ItemCard | LamentCard)[]) {
        console.log("pakli:", deck.length);
        for(let i=0; i<numberOfCards; i++) {
            if(deck.length > 0) {
                const card = deck.pop();
                player.hand.push(card!);
            }
        }
    }

    private createDeck() {
        for(let i=0; i<20; i++) {
            const randomId = Math.floor(Math.random() * 5);
            this.deck.push(Math.random() < 0.5 ? new LamentCard(randomId) : new ItemCard(randomId));
        }
    }
}