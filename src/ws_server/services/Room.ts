import {generateID} from "../helpers/generateID";
import {User} from "./User";

export class Room {
    roomId: string
    roomUsers: Array<User> = []

    constructor(owner: User) {
        this.roomId = generateID(owner.name)
        this.roomUsers.push(owner)
    }

    join(user: User) {
        this.roomUsers.push(user)
    }

    forResponse() {
        return {
            roomId: this.roomId,
            roomUsers: this.roomUsers.map(user => ({name: user.name, index: user.index}))
        }
    }
}