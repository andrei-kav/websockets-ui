import {CustomError, ICreds, Room, User, Winner} from "../models/models";
import {LoginResult} from "../models/responses";
import WebSocket from "ws";

export class Store {

    private users: Map<string, User>
    private rooms: Map<string, Room>

    constructor() {
        this.users = new Map<string, User>()
        this.rooms = new Map<string, Room>()
    }

    getUser(name: string): User | null {
        return this.users.get(name) || null
    }

    getAll(): Array<User> {
        return Array.from(this.users.values())
    }

    getWinners(): Array<Winner> {
        return Array.from(this.users.values()).map(user => new Winner(user))
    }

    getRoom(id: string): Room | null {
        return this.rooms.get(id) || null
    }

    getAvailableRooms(): Array<Room> {
        return Array.from(this.rooms.values()).filter(room => room.roomUsers.length === 1)
    }

    authenticate(data: ICreds, ws: WebSocket): LoginResult | undefined {
        const user = this.users.get(data.name)
        if (user) {
            if (user.password !== data.password) {
                return new LoginResult(user.name, user.index, true, 'invalid password')
            }
            return new LoginResult(user.name, user.index, false, '')
        }
        // create new user
        const newUser = new User(data, ws)
        this.users.set(data.name, newUser)
    }

    createRoom(user: User) {
        const newRoom = new Room(user)
        this.rooms.set(newRoom.roomId, newRoom)
    }

    addToRoom(roomId: string, user: User): Room {
        const room = this.getRoom(roomId)
        if (!room) {
            throw new CustomError('error', `room ${roomId} is not found`)
        }
        if (room.roomUsers.some(roomUser => roomUser.index === user.index)) {
            // user already in this room
            throw new CustomError('error', `You are the owner of this room`)
        }
        room.join(user)
        return room;
    }
}