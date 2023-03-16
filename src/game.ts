import { Roulette } from './roullete';
import { Player } from "./player";
import { isALetter } from "./utils/responseFilter";
import { questionsDB } from "./utils/words";
import { count } from 'console';

class Game {
    private _questions = questionsDB;
    private currentWord;
    private isFirstPlayerTurn;
    private board: string[] = [];
    private calledLetters: string[] = [];
    private roulette: Roulette = new Roulette();

    constructor(private playerOne: Player, private playerTwo: Player) {
        this.currentWord = this._getRandomWord();
        this.board = this._createBoard();
        this.isFirstPlayerTurn = true;
    }


    public showBoard() {
        this.playerOne.notify(`\nPainel: ${this.board.join(' ')}`)
        this.playerTwo.notify(`\nPainel: ${this.board.join(' ')}`)
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
            return this.currentWord.name.split(char).length -1;
        } else {
            return 0;
        }
    }

    public start(): void {
        this.playerOne.notify('Jogador 2 encontrado!\n Voce será o jogador 1\n');
        this.playerTwo.notify("Voce é o jogador 2")
        this.showBoard();
        this.playerOne.notify(`Pista: ${this.currentWord.tip}`)
        this.playerTwo.notify(`Pista: ${this.currentWord.tip}`)

        // let score = this.roulette.spin();
        
        this.playerOne.socket.write(`Uma letra por favor: `)
        
        
        this.playerTwo.socket.write('\nJogador 1 inicia respondendo\n')
        
        this.playerOne.socket.on('data', (data) => {
            // let score = this.roulette.spin();
            if(!this.isFirstPlayerTurn) {
                this.playerOne.socket.write('Espere a sua vez')
                return
            }
            if (isALetter(data.toString())  && !this.calledLetters.includes(data.toString())) {
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
                        this.playerTwo.closeConnection();
                        this.playerOne.closeConnection()
                        return;
                    }
                    this.showBoard();
                    this.playerOne.notify(`Iinforme outra letra\n`);
                    // let score = this.roulette.spin();
                    
                } else {
                    this.playerOne.notify("Voce errou");
                    this.showBoard();
                    this.playerTwo.notify("sua vez, jogador 2");
                    this.isFirstPlayerTurn = !this.isFirstPlayerTurn;
                }
            } else {
                if(this.calledLetters.includes(data.toString())) {
                    this.playerOne.notify("A letra informada já foi chamada!")
                } else {
                    this.playerOne.notify("Você não digitou uma letra válida ")
                }
                this.playerOne.notify("Digite novamente:")
            }
            
            
        });
        
        this.playerTwo.socket.on('data', (data) => {
            if(this.isFirstPlayerTurn) {
                this.playerTwo.socket.write('Espere a sua vez')
                return
            }
            // // let score = this.roulette.spin();
            // if(score == -1) {
            //     this.playerTwo.notify('Perdeu tudo!');
            //     this.playerTwo.points = 0;
            //     return
            // }
            // if(score == 0) {
            //     this.playerTwo.notify('Passou a vez!');
            //     return
            // }
            if (isALetter(data.toString())  && !this.calledLetters.includes(data.toString())) {
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
                if(this.calledLetters.includes(data.toString())) {
                    this.playerTwo.notify("A letra informada já foi chamada!")
                } else {
                    this.playerTwo.notify("Você não digitou uma letra válida ")
                }
                this.playerTwo.notify("Digite novamente:")
            }
            
            
        });
        
        
    }
}

export {Game}