import { Socket } from "net";

class Player {
    constructor(public name: string | null, public socket: Socket, public points: number) { }

    getName(): string | null {
        return this?.name;
    }
    setName(name: string) {
        this.name = name;
    }
    closeConnection() {
        this.socket.end()
    }


    notify(msg: string) {
        this.socket.write(`\n${msg}\n`)
    }
}

export { Player };
