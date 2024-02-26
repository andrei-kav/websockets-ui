import {IShip} from "../models/models";
import {User} from "./User";

export class Game {

    private enemyField: Array<Array<0|1>>
    private yourField: Array<Array<0|1>>
    private yourShips: Array<IShip>

    constructor(
        private id: string,
        private you: User,
        private enemy: User,
        private turn: boolean
    ) {
        this.init()
    }

    public addShips(ships: Array<IShip>) {
        this.yourShips = ships
        this.yourField = this.formMatrix()
        this.yourShips.forEach(ship => {
            const { x, y } = ship.position

            if (ship.direction) {
                // vertical
                for (let i = y; i < y + ship.length; i++) {
                    (this.yourField[i] as Array<0 | 1>)[x] = 1
                }
            } else {
                // horizontal
                for (let j = x; j < x + ship.length; j++) {
                    (this.yourField[y] as Array<0 | 1>)[j] = 1
                }
            }
        })

        if (this.enemy.isReadyToStart()) {
            this.you.startGame()
            this.enemy.startGame()
        }
    }

    isReadyToStart(): boolean {
        return !!this.yourField
    }

    getShips(): Array<IShip> {
        return this.yourShips
    }

    isMyTurn(): boolean {
        return this.turn
    }

    private init() {
        console.log(!!this.id)
        console.log(!!this.enemyField)
        this.enemyField = this.formMatrix()
    }

    private formMatrix(): Array<Array<0>> {
        return Array.from({ length: 10 }, () =>
            Array(10).fill(0)
        )
    }
}