export interface ICreds {
    name: string;
    password: string;
}

export interface IUserData extends ICreds {
    wins: number;
}

export interface IShip {
    position: {
        x: number;
        y: number;
    },
    // true if vertical
    direction: boolean;
    length: number;
    type: 'small'|'medium'|'large'|'huge';
}

export interface IRandomAttack {
    gameId: string;
    indexPlayer: string;
}

export interface IAttack extends IRandomAttack {
    x: number;
    y: number;
}

export class ShotHandled {
    position: { x: number, y: number }
    status: 'miss'|'killed'|'shot'
    constructor(x: number, y: number, status: 'miss'|'killed'|'shot') {
        this.position = {x, y}
        this.status = status
    }
}

export class ShipToPlay {
    positions: Array<{
        x: number;
        y: number;
        attacked: boolean;
    }>
    // direction is true if vertical
    direction: boolean
    destroyed: boolean

    constructor(ship: IShip) {
        this.direction = ship.direction
        let {x: startX, y: startY} = ship.position
        this.positions = []
        for (let i = 0; i < ship.length; i++) {
            const x = startX + (!this.direction ? i : 0)
            const y = startY + (this.direction ? i : 0)
            this.positions.push({x, y, attacked: false})
        }
        this.destroyed = false
    }
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

export class Winner {
    name: string
    wins: number
    constructor(user: IUserData) {
        this.name = user.name
        this.wins = user.wins
    }
}