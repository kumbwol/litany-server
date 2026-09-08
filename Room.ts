import {Player} from "./Player";
import {WebSocket} from "ws";
import {Card} from "./card/Card";

export class Room {
    private players = new Map<string, Player>();
    private deck: Card[] = [];
    private isGameStarted = false;

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

    public getPlayers() {
        return this.players;
    }

    public addPlayer(playerName: string, socket: WebSocket) {
        if(!this.players.has(playerName) && this.players.size < 2) {
            this.players.set(playerName, new Player(playerName, socket));
        }

        if(this.players.size === 2 && !this.isGameStarted) {
            this.startGame()
        }
    }

    private resetRoom() {
        this.deck = [];
        this.isGameStarted = false;
    }

    private startGame() {
        this.isGameStarted = true;
        this.createDeck();

        this.players.forEach((player: Player) => {
            this.drawCards(player, 5, this.deck);
            this.sendCards(player);
        });
    }

    private sendCards(player: Player) {
        player.socket.send(JSON.stringify({
            type: "CARDS_DEALT",
            cards: player.hand
        }));
    }

    private drawCards(player: Player, numberOfCards: number, deck: Card[]) {
        for(let i=0; i<numberOfCards; i++) {
            if(deck.length > 0) {
                const card = deck.pop();
                player.hand.push(card!);
            }
        }
    }

    private createDeck() {
        for(let i=0; i<20; i++) {
            this.deck.push(new Card(Math.floor(Math.random() * 5)));
        }
    }
}