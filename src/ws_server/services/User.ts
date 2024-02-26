import WebSocket from "ws";
import {Game} from "./Game";
import {generateID} from "../helpers/generateID";
import {ResponseObj} from "../models/responses";
import {CustomError, IAttack, ICreds, IShip, ShotHandled, Winner} from "../models/models";
import {Room} from "./Room";
import {Store} from "./Store";

export class User {
    // name is supposed to be unique
    name: string
    wins = 0

    readonly index: string

    private password: string
    private ws: WebSocket
    private game: Game | null = null
    private store: Store

    constructor(data: ICreds, ws: WebSocket, store: Store) {
        this.name = data.name
        this.password = data.password
        this.index = generateID(this.name)
        this.ws = ws
        this.store = store
    }

    isPasswordValid(password: string): boolean {
        return this.password === password
    }

    updateFreeRooms(availableRooms: Array<Room>) {
        const response = new ResponseObj('update_room', availableRooms)
        this.send(response)
    }

    updateWinners(winners: Array<Winner>) {
        const response = new ResponseObj('update_winners', winners)
        this.send(response)
    }

    createGame(idGame: string, opponent: User, yourTurn: boolean) {
        const response = new ResponseObj('create_game', {idGame: idGame, idPlayer: this.index})
        this.send(response)
        this.game = new Game(idGame, this, opponent, yourTurn)
    }

    startGame() {
        const ships = this.game?.getShips()
        if (ships) {
            const response = new ResponseObj('start_game', {ships: ships, currentPlayerIndex: this.index})
            this.send(response)
            this.game?.start()
        }
    }

    initTurn(userIndex: string) {
        const response = new ResponseObj('turn', {currentPlayer: userIndex})
        this.send(response)
    }

    yourTurn() {
        this.game?.myTurn()
    }

    isPreparingToPlay(): boolean {
        return !!this.game && !this.game.yourFieldReady()
    }

    isReadyToStart(): boolean {
        return !!this.game?.yourFieldReady()
    }

    isFighting(): boolean {
        return !!this.game?.isStarted()
    }

    addShips(ships: Array<IShip>) {
        this.game?.addShips(ships)
    }

    attack(attack: IAttack) {
        if (!this.game?.isYourTurn()) {
            throw new CustomError('error', 'wait for another player makes his move')
        }
        const results = (this.game as Game).attack(attack)
        results.forEach(shot => {
            const data = {...shot, currentPlayer: this.index}
            const response = new ResponseObj('attack', data)
            this.send(response)
        })
    }

    getAttacked(attack: IAttack): Array<ShotHandled> {
        return (this.game as Game).getAttacked(attack)
    }

    win() {
        this.game = null
        this.wins = this.wins + 1
        this.sendFinish(this.index)
        this.store.notifyAboutWinners()
    }

    lose(winnerIndex: string) {
        this.game = null
        this.sendFinish(winnerIndex)
    }

    logout() {
        if (this.isFighting()) {
            this.game?.finish()
        }
    }

    private sendFinish(winnerIndex: string) {
        const response = new ResponseObj('finish', {winPlayer: winnerIndex})
        this.send(response)
    }

    private send(response: ResponseObj) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(response))
        }
    }
}