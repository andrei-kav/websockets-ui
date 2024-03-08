export enum ResponseType {
    REG = 'reg',
    UPDATE_ROOM = 'update_room',
    UPDATE_WINNERS = 'update_winners',
    CREATE_GAME = 'create_game',
    START_GAME = 'start_game',
    TURN = 'turn',
    ATTACK = 'attack',
    FINISH = 'finish',
    ERROR = 'error'
}

export class ResponseObj {
    type: ResponseType
    data: string
    id = 0

    constructor(
        type: ResponseType,
        data: Record<string, any>
    ) {
        this.type = type
        this.data = JSON.stringify(data)
    }

    toJson(): string {
        return JSON.stringify(this)
    }
}

export class LoginResult {
    constructor(
        public name: string,
        public index: string,
        public error: boolean,
        public errorText: string
    ) {}
}