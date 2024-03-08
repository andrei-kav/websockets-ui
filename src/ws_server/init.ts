import { WebSocketServer } from 'ws'
import dotenv from 'dotenv'
import {Client} from "./services/Client";
import {Store} from "./services/Store";
dotenv.config()

export const init = () => {
    const store = new Store()

    const WS_PORT = Number(process.env.PORT || 3000)
    const server = new WebSocketServer({port: WS_PORT})

    server.on('connection', ws => {
        new Client(ws, store)
    })

    server.on('close', () => {
        console.log('ws server closed')
        server.clients.forEach(client => client.close(0))
    })
}