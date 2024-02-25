import { httpServer } from "./src/http_server/index";
import {init} from "./src/ws_server/init";

const HTTP_PORT = 8181;

init()

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);
