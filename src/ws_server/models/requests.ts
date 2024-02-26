import {IAttack, ICreds, IShip} from "./models";

/**
 * create / login
 */
type Login = 'reg'
export const LOGIN: Login = 'reg'
export interface RequestLoginCreateUser {
    type: Login;
    data: ICreds;
    id: 0
}
export const isLoginCreate = (data: Record<string, any>): data is RequestLoginCreateUser => {
    return data?.type === LOGIN
        && data?.id === 0
        && typeof data?.data?.name === 'string'
        && !!data?.data?.name.length
        && typeof data?.data?.password === 'string'
        && !!data?.data?.password.length
}

/**
 * create room
 */
type CreateRoom = 'create_room'
export const CREATE_ROOM: CreateRoom = 'create_room'
export interface RequestCreateRoom {
    type: CreateRoom;
    data: '';
    id: 0
}
export const isCreateRoom = (data: Record<string, any>): data is RequestCreateRoom => {
    return data?.type === CREATE_ROOM
        && data?.id === 0
        && typeof data?.data === 'string'
        && !data?.data.length
}

/**
 * add yourself to somebodys room
 */
type AddYourselfToRoom = 'add_user_to_room'
export const ADD_TO_ROOM: AddYourselfToRoom = 'add_user_to_room'
export interface RequestAddYourselfToRoom {
    type: AddYourselfToRoom;
    data: {
        indexRoom: string;
    };
    id: 0
}
export const isAddYourselfToRoom = (data: Record<string, any>): data is RequestAddYourselfToRoom => {
    return data?.type === ADD_TO_ROOM
        && data?.id === 0
        && typeof data?.data?.indexRoom === 'string'
        && !!data?.data.indexRoom.length
}

/**
 * add ships
 */
type AddShips = 'add_ships'
export const ADD_SHIPS: AddShips = 'add_ships'
export interface RequestAddShips {
    type: AddShips;
    data: {
        gameId: string;
        ships: Array<IShip>,
        indexPlayer: string;
    };
    id: 0
}
export const isAddShips = (data: Record<string, any>): data is RequestAddShips => {
    return data?.type === ADD_SHIPS
        && data?.id === 0
        && !!data?.data.gameId.length
        && !!data?.data.ships?.length
        && !!data?.data.indexPlayer?.length
}

/**
 * add ships
 */
type Attack = 'attack'
export const ATTACK: Attack = 'attack'
export interface RequestAttack {
    type: Attack;
    data: IAttack;
    id: 0
}
export const isAttack = (data: Record<string, any>): data is RequestAttack => {
    return data?.type === ATTACK
        && data?.id === 0
        && !!data?.data.gameId?.length
        && typeof data?.data?.x === 'number'
        && typeof data?.data?.y === 'number'
        && !!data?.data.indexPlayer?.length
}