import {CustomError, ICreds, IUserData, Winner} from "../models/models";
import {LoginResult} from "../models/responses";
import WebSocket from "ws";
import {User} from "./User";
import {Room} from "./Room";

export class Store {

    private usersData: Map<string, IUserData>
    private usersAuthenticated: Map<string, User>
    private rooms: Map<string, Room>

    constructor() {
        this.usersData = new Map<string, IUserData>()
        this.usersAuthenticated = new Map<string, User>()
        this.rooms = new Map<string, Room>()
    }

    authenticate(data: ICreds, ws: WebSocket): User | LoginResult | undefined {
        const userData = this.usersData.get(data.name)
        if (userData) {
            const user = new User(userData, ws, this)
            if (user.isPasswordMatched(data.password)) {
                // success
                this.usersAuthenticated.set(user.index, user)
                user.updateWinners(this.getWinners())
                user.updateFreeRooms(this.getFreeRooms())
                return user
            }
            return new LoginResult(user.name, user.index, true, 'invalid password')
        }
        // create new user
        this.usersData.set(data.name, {...data, wins: 0})
        this.notifyAllAboutWinners()
    }

    createRoom(user: User): Room {
        const newRoom = new Room(user)
        this.rooms.set(newRoom.roomId, newRoom)
        this.notifyAllAboutFreeRooms()
        return newRoom
    }

    removeRoom(roomId: string) {
        this.rooms.delete(roomId)
        this.notifyAllAboutFreeRooms()
    }

    addToRoom(roomId: string, user: User): Room {
        const room = this.rooms.get(roomId)
        if (!room) {
            throw new CustomError('error', `room ${roomId} is not found`)
        }
        if (room.roomUsers.some(roomUser => roomUser.index === user.index || roomUser.name === user.name)) {
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
        this.getAllAuthenticatedUsers().forEach(callback)
    }

    userWon(name: string) {
        const userData = this.usersData.get(name)
        if (!userData) {
            throw new CustomError('error', `user ${name} is not found in DB`)
        }
        const updated = {...userData, wins: userData.wins + 1}
        this.usersData.delete(name)
        this.usersData.set(name, updated)
    }

    logout(userIndex: string) {
        this.usersAuthenticated.delete(userIndex)
    }

    private getWinners(): Array<Winner> {
        return this.getAllUsersData()
            .map(user => new Winner(user))
            .sort((a: Winner, b: Winner) => b.wins - a.wins)
    }

    private getFreeRooms(): Array<Room> {
        return Array.from(this.rooms.values())
            .filter(room => room.roomUsers.length === 1)
    }

    private getAllUsersData(): Array<IUserData> {
        return Array.from(this.usersData.values())
    }

    private getAllAuthenticatedUsers(): Array<User> {
        return Array.from(this.usersAuthenticated.values())
    }
}