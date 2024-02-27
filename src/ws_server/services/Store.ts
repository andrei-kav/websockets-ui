import {CustomError, ICreds, Winner} from "../models/models";
import {LoginResult} from "../models/responses";
import WebSocket from "ws";
import {User} from "./User";
import {Room} from "./Room";

export class Store {

    private users: Map<string, User>
    private rooms: Map<string, Room>

    constructor() {
        this.users = new Map<string, User>()
        this.rooms = new Map<string, Room>()
    }

    authenticate(data: ICreds, ws: WebSocket): User | LoginResult | undefined {
        const user = this.users.get(data.name)
        if (user) {
            if (user.isPasswordMatched(data.password)) {
                // success
                user.updateWinners(this.getWinners())
                user.updateFreeRooms(this.getFreeRooms())
                return user
            }
            return new LoginResult(user.name, user.index, true, 'invalid password')
        }
        // create new user
        const newUser = new User(data, ws, this)
        this.users.set(data.name, newUser)
        this.notifyAllAboutWinners()
    }

    createRoom(user: User) {
        const newRoom = new Room(user)
        this.rooms.set(newRoom.roomId, newRoom)
        this.notifyAllAboutFreeRooms()
    }

    addToRoom(roomId: string, user: User): Room {
        const room = this.rooms.get(roomId)
        if (!room) {
            throw new CustomError('error', `room ${roomId} is not found`)
        }
        if (room.roomUsers.some(roomUser => roomUser.index === user.index)) {
            // user already in this room
            throw new CustomError('error', `You are the owner of this room`)
        }
        if (room.roomUsers.some(roomUser => roomUser.isInGame())) {
            // room owner is already playing
            throw new CustomError('error', `Room owner is already playing`)
        }
        room.join(user)
        this.notifyAllAboutFreeRooms()
        return room
    }

    notifyAllAboutFreeRooms() {
        const rooms = this.getFreeRooms()
        this.notifyAll(user => user.updateFreeRooms(rooms))
    }

    notifyAllAboutWinners() {
        const winners = this.getWinners()
        this.notifyAll(user => user.updateWinners(winners))
    }

    notifyAll(callback: (user: User) => void) {
        this.getAll().forEach(callback)
    }

    private getWinners(): Array<Winner> {
        return Array.from(this.users.values())
            .map(user => new Winner(user))
            .sort((a: Winner, b: Winner) => b.wins - a.wins)
    }

    private getFreeRooms(): Array<Room> {
        return Array.from(this.rooms.values())
            .filter(room => room.roomUsers.length === 1)
    }

    private getAll(): Array<User> {
        return Array.from(this.users.values())
    }
}