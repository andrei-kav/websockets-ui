import WebSocket from "ws";
import {Game} from "./Game";
import {generateID} from "../helpers/generateID";
import {ResponseObj, ResponseType} from "../models/responses";
import {CustomError, IAttack, ICreds, IRandomAttack, IShip, ShotHandled, Winner} from "../models/models";
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

    isPasswordMatched(password: string): boolean {
        return this.password === password
    }

    createRoom() {
        this.store.createRoom(this)
    }

    addYourselfToRoom(roomId: string) {
        const room = this.store.addToRoom(roomId, this)
        if (room) {
            this.tryCreateGame(room)
        }
    }

    updateFreeRooms(freeRooms: Array<Room>) {
        const availableRooms = freeRooms.map(room => room.forResponse())
        const response = new ResponseObj(ResponseType.UPDATE_ROOM, availableRooms)
        this.send(response)
    }

    updateWinners(winners: Array<Winner>) {
        const response = new ResponseObj(ResponseType.UPDATE_WINNERS, winners)
        this.send(response)
    }

    startGame() {
        const ships = this.game?.getShips()
        if (ships) {
            const response = new ResponseObj(ResponseType.START_GAME, {ships: ships, currentPlayerIndex: this.index})
            this.send(response)
            this.game?.start()
        }
    }

    initTurn(userIndex: string) {
        const response = new ResponseObj(ResponseType.TURN, {currentPlayer: userIndex})
        this.send(response)
    }

    yourTurn() {
        this.game?.myTurn()
    }

    isInGame(): boolean {
        return !!this.game
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
            const response = new ResponseObj(ResponseType.ATTACK, data)
            this.send(response)
        })
    }

    randomAttack(randomAttack: IRandomAttack) {
        const position = (this.game as Game).getFreeEnemyCell()
        this.attack({...position, ...randomAttack})
    }

    getAttacked(attack: IAttack): Array<ShotHandled> {
        return (this.game as Game).getAttacked(attack)
    }

    win() {
        this.game = null
        this.wins = this.wins + 1
        this.sendFinish(this.index)
        this.store.notifyAllAboutWinners()
    }

    lose(winnerIndex: string) {
        this.game = null
        this.sendFinish(winnerIndex)
    }

    logout() {
        this.game?.finish()
    }

    private tryCreateGame(room: Room) {
        const users = room.roomUsers;
        if (users.length !== 2) {
            throw new CustomError('error', 'failed to create a game')
        }

        const opponent = users.filter(user => user.name !== this.name)[0]
        if (!opponent) {
            throw new CustomError('error', 'failed to create a game')
        }
        const idGame = generateID('game')
        this.createGame(idGame, opponent, false)
        opponent.createGame(idGame, this, true)
    }

    private createGame(idGame: string, opponent: User, yourTurn: boolean) {
        const response = new ResponseObj(ResponseType.CREATE_GAME, {idGame: idGame, idPlayer: this.index})
        this.send(response)
        this.game = new Game(idGame, this, opponent, yourTurn)
    }

    private sendFinish(winnerIndex: string) {
        const response = new ResponseObj(ResponseType.FINISH, {winPlayer: winnerIndex})
        this.send(response)
    }

    private send(response: ResponseObj) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(response.toJson())
        }
    }
}