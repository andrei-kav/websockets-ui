import {Store} from "./Store";
import WebSocket, {RawData} from "ws";
import {
    ADD_TO_ROOM,
    CREATE_ROOM, IsAddYourselfToRoom,
    IsCreateRoom,
    IsLoginCreate,
    LOGIN
} from "../models/requests";
import {CustomError, ICreds, Room, User} from "../models/models";
import {ResponseObj} from "../models/responses";
import {generateID} from "../helpers/generateID";
import {ableToCreateGame} from "../helpers/ableToCreateGame";

export class Client {

    private user: User | null = null

    constructor(
        private webSocket: WebSocket,
        private store: Store
    ) {
        this.init()
    }

    private init() {
        this.webSocket.on('message', message => this.handle(message))
        this.webSocket.on('close', () => this.close());
    }

    private handle(message: RawData) {
        try {
            this.tryHandleMessage(message)
        } catch (e: any) {
            this.handleError(e)
        }
    }

    private tryHandleMessage(message: RawData) {
        const parsed = this.parseMessage(message)
        const type = parsed.type
        switch (type) {
            case LOGIN:
                if (IsLoginCreate(parsed)) {
                    this.login(parsed.data)
                    break;
                }
            case CREATE_ROOM:
                if (IsCreateRoom(parsed) && this.user) {
                    this.createRoom(this.user)
                    break;
                }
            case ADD_TO_ROOM:
                if (IsAddYourselfToRoom(parsed) && this.user) {
                    this.addYourselfToRoom(parsed.data.indexRoom, this.user)
                    break;
                }
            default:
                throw new CustomError('error', 'got invalid request')
        }
    }

    private login(creds: ICreds) {
        const result = this.store.authenticate(creds, this.webSocket)
        if (!result) {
            // no result if this is the process of registration
            return
        }

        // notify front
        this.send(new ResponseObj(LOGIN, result))

        if (result.error) {
            // no user => do nothing
            return
        }

        this.user = this.store.getUser(result.name)
        this.updateWinners()
        this.updateAvailableRooms()
    }

    private createRoom(user: User) {
        this.store.createRoom(user)
        // update available rooms info
        this.updateAvailableRooms()
    }

    private addYourselfToRoom(roomId: string, user: User) {
        const room = this.store.addToRoom(roomId, user)
        // update available rooms info
        this.updateAvailableRooms()
        if (room) {
            this.createGame(room)
        }
    }

    private updateAvailableRooms() {
        const rooms = this.store.getAvailableRooms()
        this.notifyAll(user => user.updateAvailableRooms(rooms))
    }

    private updateWinners() {
        const winners = this.store.getWinners()
        this.notifyAll(user => user.updateWinners(winners))
    }

    private createGame(room: Room) {
        const users = room.roomUsers;
        if (!ableToCreateGame(users)) {
            throw new CustomError('error', 'failed to create a game')
        }
        const user1 = this.store.getUser(users[0].name)
        const user2 = this.store.getUser(users[1].name)
        if (!user1 || !user2) {
            throw new CustomError('error', 'failed to create a game')
        }
        const idGame = generateID('game')
        this.notifyUsers([user1, user2], user => user.createGame(idGame))
    }

    private send(response: ResponseObj) {
        this.webSocket.send(JSON.stringify(response))
    }

    private handleError(error: any) {
        this.send(new ResponseObj('error', error))
    }

    private close() {
        console.log('client closed')
    }

    private parseMessage(message: RawData): Record<string, any> {
        const parsed = JSON.parse(message.toString())

        if (!parsed) {
            throw new CustomError('error', 'got invalid request')
        }

        if (typeof parsed.data === 'string' && parsed.data.length) {
            parsed.data = JSON.parse(parsed.data)
        }

        return parsed
    }

    private notifyUsers(users: Array<User>, callback: (user: User) => void) {
        users.forEach(callback)
    }

    private notifyAll(callback: (user: User) => void) {
        this.notifyUsers(this.store.getAll(), callback)
    }
}