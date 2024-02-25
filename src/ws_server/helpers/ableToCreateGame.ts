import {User} from "../models/models";

export const ableToCreateGame = (users: Array<Pick<User, 'name' | 'index'>>): users is [Pick<User, 'name' | 'index'>, Pick<User, 'name' | 'index'>] => {
    return users.length === 2
        && !!users[0]?.name.length
        && !!users[0]?.index.length
        && !!users[1]?.name.length
        && !!users[1]?.index.length
}