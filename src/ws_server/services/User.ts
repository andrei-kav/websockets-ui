import WebSocket from "ws";
import {Game} from "./Game";
import {generateID} from "../helpers/generateID";
import {ResponseObj} from "../models/responses";
import {ICreds, IShip, Winner} from "../models/models";
import {Room} from "./Room";

export class User {
    // name is supposed to be unique
    name: string
    wins = 0

    readonly index: string

    private password: string
    private ws: WebSocket
    private game: Game | null = null

    constructor(data: ICreds, ws: WebSocket) {
        this.name = data.name
        this.password = data.password
        this.index = generateID(this.name)
        this.ws = ws
    }

    isPasswordValid(password: string): boolean {
        return this.password === password
    }

    updateAvailableRooms(availableRooms: Array<Room>) {
        const response = new ResponseObj('update_room', availableRooms)
        this.send(response)
    }

    updateWinners(winners: Array<Winner>) {
        const response = new ResponseObj('update_winners', winners)
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

    isPreparingToPlay(): boolean {
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