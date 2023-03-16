import { PismaSingleton } from './database/prisma_singleton';
import { Player } from "./player";
import { Roulette } from './roullete';
import { isALetter } from "./utils/responseFilter";
import { questionsDB } from "./utils/words";

class Game {
    private _questions = questionsDB;
    private currentWord;
    private isFirstPlayerTurn;
    private board: string[] = [];
    private calledLetters: string[] = [];
    private roulette: Roulette = new Roulette();
    private db: PismaSingleton = PismaSingleton.getInstance();

    constructor(private playerOne: Player, private playerTwo: Player) {
        this.currentWord = this._getRandomWord();
        this.board = this._createBoard();
        this.isFirstPlayerTurn = true;
    }


    public showBoard() {
        this.playerOne.notify(`\nPainel: ${this.board.join(' ')}\n`)
        this.playerOne.notify(`Pista: ${this.currentWord.tip}`)

        this.playerTwo.notify(`\nPainel: ${this.board.join(' ')}`)
        this.playerTwo.notify(`Pista: ${this.currentWord.tip}`)

    }
    public showPoints() {
        this.playerOne.notify(`\nyou ${this.playerOne.points.toString()} \n player two ${this.playerTwo.points.toString()}\n`)
        this.playerTwo.notify(`\nyou ${this.playerTwo.points.toString()} \n player one ${this.playerOne.points.toString()}\n`)
    }
    private _createBoard(): string[] {
        const chars = this.currentWord.name.trim().split("");
        const board: string[] = chars.map((_) => '_');

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
            if (word[i] === char.toLowerCase()) {
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
            return this.currentWord.name.split(char).length - 1;
        } else {
            return 0;
        }
    }

    public start(): void {
        this.playerOne.notify('Jogador 2 encontrado!\n Voce será o jogador 1\n');
        this.playerTwo.notify("Voce é o jogador 2")
        this.showBoard();


        this.playerOne.notify("Informe seu userName?")
        this.playerTwo.notify("Informe seu userName?")

        let selectedNamePlayerOne: string | null = null;
        let selectedNamePlayerTwo: string | null = null;

        this.playerOne.socket.on('data', async (data) => {

            if (selectedNamePlayerOne) {
                if (!this.isFirstPlayerTurn) {
                    this.playerOne.socket.write('Espere a sua vez')
                    return
                }
                if (isALetter(data.toString()) && !this.calledLetters.includes(data.toString())) {
                    this.calledLetters.push(data.toString())
                    const result = this._verifyIfUserGuessedChar(data.toString().toLowerCase())
                    if (result != 0) {
                        this._changeBoardForShowChar(data.toString())
                        this.playerOne.notify("Voce acertou");
                        this.playerOne.points++;
                        this.showPoints()
                        if (this.verifyIfHasWin()) {
                            this.playerOne.notify("Você venceu\n")
                            this.playerTwo.notify("Você perdeu\n")
                            await this.db.setScore(selectedNamePlayerOne!, 'sim');
                            await this.db.setScore(selectedNamePlayerTwo!, 'não');
                            const scorePlayer1 = await this.db.getScore(selectedNamePlayerOne!);
                            const scorePlayer2 = await this.db.getScore(selectedNamePlayerTwo!);
                            this.playerOne.notify(`seu score: ${JSON.stringify(scorePlayer1?.score)}`)
                            this.playerTwo.notify(`seu score: ${JSON.stringify(scorePlayer2?.score)}`)
                            this.playerTwo.closeConnection();
                            this.playerOne.closeConnection()
                            return;
                        }
                        this.showBoard();
                        this.playerOne.notify(`Iinforme outra letra\n`);

                    } else {
                        this.playerOne.notify("Voce errou");
                        this.showBoard();
                        this.playerTwo.notify("sua vez, jogador 2");
                        this.isFirstPlayerTurn = !this.isFirstPlayerTurn;
                    }
                } else {
                    if (this.calledLetters.includes(data.toString())) {
                        this.playerOne.notify("A letra informada já foi chamada!")
                    } else {
                        this.playerOne.notify("Você não digitou uma letra válida ")
                    }
                    this.playerOne.notify("Digite novamente:")
                }
            } else {

                const name = data.toString();
                const userAlreadyExists = await this.db.verifyIfUserAlreadyExists(name);
                if (!userAlreadyExists) {
                    await this.db.createUser(name)
                    this.playerOne.setName(name);

                    selectedNamePlayerOne = name;
                    this.playerOne.socket.write(`Uma letra por favor: `)

                } else {
                    this.playerOne.notify(`Bem vindo de volta ${name}`)
                    this.playerOne.socket.write(`Uma letra por favor: `)
                    selectedNamePlayerOne = name;

                }

            }

        });


        this.playerTwo.socket.on('data', async (data) => {
            if (selectedNamePlayerTwo) {

                if (this.isFirstPlayerTurn) {
                    this.playerTwo.socket.write('Espere a sua vez')
                    return
                }

                if (isALetter(data.toString()) && !this.calledLetters.includes(data.toString())) {
                    this.calledLetters.push(data.toString())
                    const result = this._verifyIfUserGuessedChar(data.toString().toLowerCase())
                    if (result != 0) {
                        this._changeBoardForShowChar(data.toString())
                        this.playerTwo.notify("Voce acertou");
                        this.playerTwo.points++;
                        this.showPoints()
                        if (this.verifyIfHasWin()) {
                            this.playerTwo.notify("Você venceu\n")
                            this.playerOne.notify("Você perdeu\n")
                            await this.db.setScore(selectedNamePlayerOne!, 'não');
                            await this.db.setScore(selectedNamePlayerTwo!, 'sim');
                            const scorePlayer1 = await this.db.getScore(selectedNamePlayerOne!);
                            const scorePlayer2 = await this.db.getScore(selectedNamePlayerTwo);
                            this.playerOne.notify(`seu score: ${JSON.stringify(scorePlayer1?.score)}`)
                            this.playerTwo.notify(`seu score: ${JSON.stringify(scorePlayer2?.score)}`)
                            this.playerOne.closeConnection();
                            this.playerTwo.closeConnection()
                            return;
                        }
                        this.showBoard();
                        // score = this.roulette.spin();
                        this.playerTwo.notify(`Informe outra letra\n`);

                    } else {
                        this.playerTwo.notify("Voce errou");
                        this.showBoard();
                        this.playerOne.notify("sua vez, jogador 1");
                        this.isFirstPlayerTurn = !this.isFirstPlayerTurn;
                    }
                } else {
                    if (this.calledLetters.includes(data.toString())) {
                        this.playerTwo.notify("A letra informada já foi chamada!")
                    } else {
                        this.playerTwo.notify("Você não digitou uma letra válida ")
                    }
                    this.playerTwo.notify("Digite novamente:")
                }
            } else {
                const name = data.toString();
                const userAlreadyExists = await this.db.verifyIfUserAlreadyExists(name);
                if (!userAlreadyExists) {
                    await this.db.createUser(name)
                    this.playerTwo.setName(name);
                    selectedNamePlayerTwo = name;
                    this.playerTwo.socket.write('\nJogador 1 inicia respondendo\n')

                } else {
                    this.playerTwo.notify(`Bem vindo de volta ${name}`)
                    selectedNamePlayerTwo = name;
                    this.playerTwo.socket.write('\nJogador 1 inicia respondendo\n')
                }
            }


        });


    }
}

export { Game };
