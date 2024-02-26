import {generateID} from "../helpers/generateID";
import WebSocket from "ws";
import {ResponseObj} from "./responses";
import {Game} from "../services/Game";

export interface ICreds {
    name: string;
    password: string;
}

export interface IShip {
    position: {
        x: number;
        y: number;
    },
    direction: boolean;
    length: number;
    type: 'small'|'medium'|'large'|'huge';
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
    name: string
    password: string
    index: string
    wins = 0

    private ws: WebSocket
    private game: Game | null = null

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

    createGame(idGame: string, opponent: User, turn: boolean) {
        const response = new ResponseObj('create_game', {idGame: idGame, idPlayer: this.index})
        this.send(response)
        this.game = new Game(idGame, this, opponent, turn)
    }

    startGame() {
        const ships = this.game?.getShips()
        if (ships) {
            const response = new ResponseObj('start_game', {ships: ships, currentPlayerIndex: this.index})
            this.send(response)
            this.takeTurn()
        }
    }

    takeTurn() {
        const turn = this.game?.isMyTurn()
        if (turn) {
            const response = new ResponseObj('turn', {currentPlayerIndex: this.index})
            this.send(response)
        }
    }

    isPreparing(): boolean {
        return !!this.game && !this.game.isReadyToStart()
    }

    isReadyToStart(): boolean {
        return !!this.game?.isReadyToStart()
    }

    addShips(ships: Array<IShip>) {
        this.game?.addShips(ships)
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