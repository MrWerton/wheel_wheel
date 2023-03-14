import { Game } from "./game";
import { Player } from "./player";

class Channel {
    private _player1: Player | null = null;
    private _player2: Player | null = null;

    public addUser(user: Player): boolean {
        if (this._player1 === null) {
            this._player1 = user;
            this._player1.notify(` aguardando outro player...!\n`);
            return true;
        } else if (this._player2 === null) {
            this._player2 = user;
            return true;
        } else {
            return false;
        }
    }

    public startGamer(): void {
        if (this._player1 && this._player2) {
            const gamer = new Game(this._player1, this._player2);
            gamer.start();
        }
    }
}

export {Channel}