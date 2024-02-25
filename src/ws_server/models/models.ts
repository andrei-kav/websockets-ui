import {generateID} from "../helpers/generateID";
import WebSocket from "ws";
import {ResponseObj} from "./responses";

export interface ICreds {
    name: string;
    password: string;
}

export class CustomError {
    type: string
    data: Error
    id: 0

    constructor(type: string, message: string) {
        this.type = type;
        this.data = new Error(message)
    }
}

export class User implements ICreds {
    // name is supposed to be unique
    name: string;
    password: string;
    index: string;
    wins = 0;

    private ws: WebSocket;

    constructor(data: ICreds, ws: WebSocket) {
        this.name = data.name
        this.password = data.password
        this.index = generateID(this.name)
        this.ws = ws
    }

    updateAvailableRooms(availableRooms: Array<Room>) {
        const response = new ResponseObj('update_room', availableRooms)
        this.send(response)
    }

    updateWinners(users: Array<Winner>) {
        const response = new ResponseObj('update_winners', users)
        this.send(response)
    }

    createGame(idGame: string) {
        const response = new ResponseObj('create_game', {idGame: idGame, idPlayer: this.index})
        this.send(response)
    }

    private send(response: ResponseObj) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(response))
        }
    }
}

export class Winner {
    name: string
    wins: number
    constructor(user: User) {
        this.name = user.name
        this.wins = user.wins
    }
}

export class Room {
    roomId: string
    roomUsers: Array<Pick<User, 'name' | 'index'>> = []

    constructor(owner: User) {
        this.roomId = generateID(owner.name)
        this.roomUsers.push({name: owner.name, index: owner.index})
    }

    join(user: User) {
        this.roomUsers.push({name: user.name, index: user.index})
    }
}