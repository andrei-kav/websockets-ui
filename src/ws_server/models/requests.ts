import {ICreds} from "./models";

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
export const IsLoginCreate = (data: Record<string, any>): data is RequestLoginCreateUser => {
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
export const IsCreateRoom = (data: Record<string, any>): data is RequestCreateRoom => {
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
export const IsAddYourselfToRoom = (data: Record<string, any>): data is RequestAddYourselfToRoom => {
    return data?.type === ADD_TO_ROOM
        && data?.id === 0
        && typeof data?.data?.indexRoom === 'string'
        && !!data?.data.indexRoom.length
}

/**
 * add ships
 */
// type AddShips = 'add_ships'
// export const ADD_SHIPS: AddShips = 'add_ships'
// export interface RequestAddShips {
//     type: AddShips;
//     data: {
//         gameId: string;
//         ships: [
//             {
//                 position: {
//                     x: number;
//                     y: number;
//                 },
//                 direction: boolean;
//                 length: number;
//                 type: 'small'|'medium'|'large'|'huge';
//             }
//         ],
//         indexPlayer: string;
//     };
//     id: 0
// }
// export const IsAddShips = (data: Record<string, any>): data is RequestAddShips => {
//     return data?.type === ADD_SHIPS
//         && data?.id === 0
//         && typeof data?.data?.gameId === 'string'
//         && !!data?.data.gameId.length
//         && !!data?.data.ships?.length
//         && !!data?.data.indexPlayer?.length
// }