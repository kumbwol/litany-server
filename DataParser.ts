export enum MessageType {
    ENTER,
    CLOSE
}

export type DataParser =
    | { type: MessageType.ENTER, roomId: string; playerName: string; }
    | { type: MessageType.CLOSE; }