import {CustomError, IAttack, IShip, ShipToPlay, ShotHandled} from "../models/models";
import {User} from "./User";

export class Game {

    private enemyField: Array<Array<0|1>>

    private shipsGotFromRequest: Array<IShip>
    private shipsToPLay: Array<ShipToPlay>

    private started = false

    constructor(
        private id: string,
        private you: User,
        private enemy: User,
        private turn: boolean
    ) {
        this.init()
    }

    public addShips(ships: Array<IShip>) {
        this.shipsGotFromRequest = ships
        this.shipsToPLay = ships.map(ship => new ShipToPlay(ship))

        if (this.enemy.isReadyToStart()) {
            this.you.startGame()
            this.enemy.startGame()
        }
    }

    yourFieldReady(): boolean {
        return !!this.shipsToPLay
    }

    getShips(): Array<IShip> {
        return this.shipsGotFromRequest
    }

    isYourTurn(): boolean {
        return this.turn
    }

    wait() {
        this.turn = false
        this.you.initTurn(this.enemy.index)
    }

    myTurn() {
        this.turn = true
        this.you.initTurn(this.you.index)
    }

    start() {
        this.started = true
        const userIndex = this.turn ? this.you.index : this.enemy.index
        this.you.initTurn(userIndex)
    }

    isStarted() {
        return this.started
    }

    attack(attack: IAttack): Array<ShotHandled> {
        if (this.cellAlreadyHit(attack)) {
            return []
        }

        const shots = this.enemy.getAttacked(attack)
        this.markShots(shots)

        if (!this.isAHit(shots)) {
            // change turn
            this.enemy.yourTurn()
            this.wait()
        }
        return shots
    }

    getAttacked(attack: IAttack): Array<ShotHandled> {
        const shotsHandled = this.processReceivedShot(attack)
        if (this.shipsToPLay.every(ship => ship.destroyed)) {
            this.finish()
        }
        return shotsHandled
    }

    getFreeEnemyCell(): {x: number, y: number} {
        const y = this.enemyField.findIndex(row => row.includes(0))
        const x = this.enemyField[y]?.findIndex(value => value === 0)

        if (typeof x === 'number' && x >= 0 && typeof y === 'number' && y >= 0) {
            return {x, y}
        }
        throw new CustomError('error', 'random attack failed')
    }

    finish() {
        this.enemy.win()
        this.you.lose(this.enemy.index)
    }

    private cellAlreadyHit(attack: IAttack) {
        return !!(this.enemyField[attack.y] as Array<0 | 1>)[attack.x]
    }

    private markShots(shots: Array<ShotHandled>) {
        shots.forEach(shot => {
            (this.enemyField[shot.position.y] as Array<0 | 1>)[shot.position.x] = 1
        })
    }

    private isAHit(shots: Array<ShotHandled>): boolean {
        return shots.some(shot => shot.status !== 'miss')
    }

    private processReceivedShot(attack: IAttack): Array<ShotHandled> {
        const {x, y} = attack
        const ship = this.shipsToPLay.find(ship => {
            const pos = ship.positions.find(pos => pos.x === x && pos.y === y)
            if (pos) {
                pos.attacked = true
                return true
            }
            return false
        })

        if (!ship) {
            // miss
            return [ new ShotHandled(x, y, 'miss')]
        }
        if (!ship.positions.every(pos => pos.attacked)) {
            // hit
            return [ new ShotHandled(x, y, 'shot')]
        }
        // ship destroyed
        ship.destroyed = true
        const cells = this.getCellsAround(ship)
        cells.push(new ShotHandled(x, y, 'killed'))

        return cells
    }

    private init() {
        console.log(!!this.id)
        this.enemyField = this.formMatrix()
    }

    private formMatrix(): Array<Array<0>> {
        return Array.from({ length: 10 }, () =>
            Array(10).fill(0)
        )
    }

    private getCellsAround(ship: ShipToPlay): Array<ShotHandled> {
        const cells: Array<ShotHandled> = []
        const xCorrection = ship.direction ? 1 : 0
        const yCorrection = !ship.direction ? 1 : 0

        // left or top
        cells.push(...ship.positions.map(pos => {
            const x = pos.x - xCorrection
            const y = pos.y - yCorrection
            return new ShotHandled(x, y, 'miss')
        }))

        // right or bottom
        cells.push(...ship.positions.map(pos => {
            const x = pos.x + xCorrection
            const y = pos.y + yCorrection
            return new ShotHandled(x, y, 'miss')
        }))

        // left/top
        const {x: firstX, y: firstY} = ship.positions[0] as { x: number; y: number; attacked: boolean; }
        for (let i = 0; i < 3; i++) {
            const x = (firstX - 1) + (!ship.direction ? 0 : i)
            const y = (firstY - 1) + (ship.direction ? 0 : i)
            cells.push(new ShotHandled(x, y, 'miss'))
        }

        // right/bottom
        const {x: lastX, y: lastY} = ship.positions[ship.positions.length - 1] as { x: number; y: number; attacked: boolean; }
        for (let i = 0; i < 3; i++) {
            const x = (lastX + 1) - (!ship.direction ? 0 : i)
            const y = (lastY + 1) - (ship.direction ? 0 : i)
            cells.push(new ShotHandled(x, y, 'miss'))
        }

        return cells.filter(cell => {
            const xWithin = cell.position.x > -1 && cell.position.x < 10
            const yWithin = cell.position.y > -1 && cell.position.y < 10
            return xWithin && yWithin
        })
    }
}