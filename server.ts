import net, { Socket } from 'net';

class Player {
    constructor(public name: string | null, public socket: Socket, public points: number) { }

    public getName(): string | null {
        return this?.name;
    }

    public closeConnection() {
        this.socket.end()
    }


    public notify(msg: string) {
        this.socket.write(`\n${msg}\n`)
    }
}

class Gamer {
    private _phases = [{ name: 'hello', tip: 'é a traduzido para ola' }, { name: 'world', tip: 'é a traduzido para mundo' }];
    private currentPhrase;
    private board: string[] = [];
    constructor(private playerOne: Player, private playerTwo: Player) {
        this.currentPhrase = this.getRandomWord();
        this.board = this._createBoard();
    }


    public showBoard() {
        this.playerOne.notify(`\nboard: ${this.board.toString()}`)
        this.playerTwo.notify(`\nboard: ${this.board.toString()}`)
    }
    public showPoints() {
        this.playerOne.notify(`you ${this.playerOne.points.toString()} \n player two ${this.playerTwo.points.toString()}\n`)
        this.playerTwo.notify(`you ${this.playerOne.points.toString()} \n player one ${this.playerTwo.points.toString()}\n`)
    }
    private _createBoard(): string[] {
        const chars = this.currentPhrase.name.trim().split("");
        const board: string[] = chars.map((_) => '[]');

        return board;
    }

    public verifyIfHasWin() {
        const word = this.currentPhrase.name;
        const wordOfBoard = this.board.join("")
        return word === wordOfBoard;
    }

    private _changeBoardForShowLetter(char: string) {
        const word = this.currentPhrase.name;

        for (let i in this.board) {
            if (word[i] === char) {
                this.board[i] = word[i];
            }
        }
    }


    private getRandomWord() {
        const randomIndex = Math.floor(Math.random() * this._phases.length);
        return this._phases[randomIndex];
    }

    private _verifyIfUserGuessedChar(char: string) {
        if (this.currentPhrase.name.includes(char)) {
            return true;
        } else {
            return false;
        }
    }

    public start(): void {
        this.playerOne.notify('Opponent found!\n Voce é o jogador 1\n');
        this.playerTwo.notify("Voce é o jogador 2")
        this.showBoard();
        this.playerOne.notify(`tip: ${this.currentPhrase.tip}`)
        this.playerTwo.notify(`tip: ${this.currentPhrase.tip}`)

        this.playerOne.socket.write("De acordo com a dica, qual é a palavra? ")


        this.playerTwo.socket.write('\nJogador 1 inicia respondendo\n')

        this.playerOne.socket.on('data', (data) => {
            const result = this._verifyIfUserGuessedChar(data.toString())
            if (result) {
                this._changeBoardForShowLetter(data.toString())
                this.playerOne.notify("Voce acertou");
                this.playerOne.points++;
                this.showPoints()
                if (this.verifyIfHasWin()) {
                    this.playerOne.notify("Você venceu\n")
                    this.playerTwo.notify("Você perdeu\n")
                    this.playerTwo.closeConnection();
                    this.playerOne.closeConnection()
                    return;
                }
                this.showBoard();
                this.playerOne.notify("Informe outra palavra\n");

            } else {
                this.playerOne.notify("Voce errou");
                this.showBoard();
                this.playerTwo.notify("sua vez, jogador 2");
            }

        });

        this.playerTwo.socket.on('data', (data) => {
            const result = this._verifyIfUserGuessedChar(data.toString())
            if (result) {
                this._changeBoardForShowLetter(data.toString())
                this.playerTwo.socket.write("Voce acertou\n");
                this.playerTwo.points++;
                this.showPoints()

                if (this.verifyIfHasWin()) {
                    this.playerTwo.socket.write("Você venceu")
                    this.playerOne.socket.write("Você perdeu")
                    this.playerOne.socket.end()
                    this.playerTwo.socket.end()
                    return;
                }
                this.showBoard();
                this.playerTwo.notify("informe outra palavra\n");

            } else {

                this.playerTwo.notify("Voce errou");
                this.showBoard();
                this.playerOne.notify("Sua vez");

            }



        });
    }
}

class Channel {
    private _player1: Player | null = null;
    private _player2: Player | null = null;

    public addUser(user: Player): boolean {
        if (!this._player1) {
            this._player1 = user;
            this._player1.notify(` aguardando outro player...!\n`);
            return true;
        } else if (!this._player2) {
            this._player2 = user;
            return true;
        } else {
            return false;
        }
    }

    public startGamer(): void {
        if (this._player1 && this._player2) {
            const gamer = new Gamer(this._player1, this._player2);
            gamer.start();
        }
    }
}

const channels: Channel[] = [];

const server = net.createServer((socket) => {
    let channelIsOpen = null;

    for (let i in channels) {
        const channel = channels[i];
        const userWasAdded = channel.addUser(new Player(null, socket, 0));
        if (userWasAdded) {
            channelIsOpen = channel;
            break;
        }
    }

    if (!channelIsOpen) {
        channelIsOpen = new Channel();
        channels.push(channelIsOpen);
        channelIsOpen.addUser(new Player(null, socket, 0));
    }

    channelIsOpen.startGamer();

    socket.on('data', (data) => { });

    socket.on('end', () => {

    });
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});
