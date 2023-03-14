import { Player } from "./player";
import { isALetter } from "./utils/responseFilter";
import { questionsDB } from "./utils/words";

class Game {
    private _questions = questionsDB;
    private currentWord;
    private board: string[] = [];
    constructor(private playerOne: Player, private playerTwo: Player) {
        this.currentWord = this._getRandomWord();
        this.board = this._createBoard();
    }


    public showBoard() {
        this.playerOne.notify(`\nboard: ${this.board.toString()}`)
        this.playerTwo.notify(`\nboard: ${this.board.toString()}`)
    }
    public showPoints() {
        this.playerOne.notify(`you ${this.playerOne.points.toString()} \n player two ${this.playerTwo.points.toString()}\n`)
        this.playerTwo.notify(`you ${this.playerTwo.points.toString()} \n player one ${this.playerOne.points.toString()}\n`)
    }
    private _createBoard(): string[] {
        const chars = this.currentWord.name.trim().split("");
        const board: string[] = chars.map((_) => '[]');

        return board;
    }

    public verifyIfHasWin() {
        const word = this.currentWord.name;
        const wordOfBoard = this.board.join("")
        return word === wordOfBoard;
    }

    private _changeBoardForShowChar(char: string) {
        const word = this.currentWord.name;

        for (let i in this.board) {
            if (word[i] === char) {
                this.board[i] = word[i];
            }
        }
    }


    private _getRandomWord() {
        const randomIndex = Math.floor(Math.random() * this._questions.length);
        return this._questions[randomIndex];
    }

    private _verifyIfUserGuessedChar(char: string) {
        if (this.currentWord.name.includes(char)) {
            return true;
        } else {
            return false;
        }
    }

    public start(): void {
        this.playerOne.notify('Jogador 2 encontrado!\n Voce será o jogador 1\n');
        this.playerTwo.notify("Voce é o jogador 2")
        this.showBoard();
        this.playerOne.notify(`tip: ${this.currentWord.tip}`)
        this.playerTwo.notify(`tip: ${this.currentWord.tip}`)

        this.playerOne.socket.write("De acordo com a dica, informe uma letra? ")


        this.playerTwo.socket.write('\nJogador 1 inicia respondendo\n')

        this.playerOne.socket.on('data', (data) => {
            if (isALetter(data.toString())) {
                const result = this._verifyIfUserGuessedChar(data.toString())
                if (result) {
                    this._changeBoardForShowChar(data.toString())
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
                    this.playerOne.notify("Informe outra letra\n");

                } else {
                    this.playerOne.notify("Voce errou");
                    this.showBoard();
                    this.playerTwo.notify("sua vez, jogador 2");
                }
            } else {
                this.playerOne.notify("Você não digitou uma letra válida ")
                this.playerOne.notify("Digite novamente")
            }


        });

        this.playerTwo.socket.on('data', (data) => {
            if (isALetter(data.toString())) {
                const result = this._verifyIfUserGuessedChar(data.toString())
                if (result) {
                    this._changeBoardForShowChar(data.toString())
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
                    this.playerTwo.notify("informe outra letra\n");

                } else {

                    this.playerTwo.notify("Voce errou");
                    this.showBoard();
                    this.playerOne.notify("Sua vez");

                }
            } else {
                this.playerTwo.notify("Você não digitou uma letra válida ")
                this.playerTwo.notify("Digite novamente")
            }



        });
    }
}

export {Game}