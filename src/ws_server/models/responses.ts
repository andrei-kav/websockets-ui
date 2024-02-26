export class ResponseObj {
    type: string
    data: string
    id = 0

    constructor(
        type: string,
        data: Record<string, any>
    ) {
        this.type = type
        this.data = JSON.stringify(data)
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