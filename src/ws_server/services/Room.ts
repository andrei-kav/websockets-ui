import {generateID} from "../helpers/generateID";
import {User} from "./User";

export class Room {
    roomId: string
    roomUsers: Array<Pick<User, 'name' | 'index'>> = []

    constructor(owner: User) {
        this.roomId = generateID(owner.name)
        this.roomUsers.push({name: owner.name, index: owner.index})
    }

    join(user: User) {
        this.roomUsers.push({name: user.name, index: user.index})
    }
}