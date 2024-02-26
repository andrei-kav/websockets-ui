import {User} from "../services/User";

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

export class Winner {
    name: string
    wins: number
    constructor(user: User) {
        this.name = user.name
        this.wins = user.wins
    }
}