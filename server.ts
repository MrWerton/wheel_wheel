
import net from 'net';

type Room = {
    player1?: net.Socket;
    player2?: net.Socket;
};

const rooms: Room[] = [];

const server = net.createServer((socket) => {
    let joinedRoom = false;

    for (let i = 0; i < rooms.length; i++) {
        const room = rooms[i];

        if (!room.player1) {
            room.player1 = socket;
            socket.write('Waiting for opponent...\n');
            joinedRoom = true;
            break;
        } else if (!room.player2) {
            room.player2 = socket;
            let isFirstPlayer = false;

            if (isFirstPlayer) {
                room.player1.on('data', (dt) => {
                    const message = dt.toString().trim()

                    if (message === 'Hello') {
                        room.player2?.write("jogador 1 ganhou")
                        room.player1?.write("voce ganhou")
                    } else {
                        room.player1?.write("voce errou \n")
                        room.player2?.write("sua vez \n")
                        isFirstPlayer = false;
                    }
                })
            } else {
                isFirstPlayer = true;
                room.player2.on('data', (dt) => {

                    const message = dt.toString().trim()

                    if (message === 'Hello') {
                        room.player1?.write("jogador 2 ganhou")
                        room.player2?.write("voce ganhou")

                    } else {
                        room.player2?.write("voce errou\n")
                        room.player1?.write("sua vez\n")


                    }
                })
            }


            joinedRoom = true;
            break;
        }
    }

    if (!joinedRoom) {
        const room = { player1: socket };
        rooms.push(room);
        socket.write('Waiting for opponent...\n');
    }

    if (rooms[rooms.length - 1].player1 && rooms[rooms.length - 1].player2) {
        rooms.push({}); // create a new empty room for future clients

        rooms[rooms.length - 2].player1?.write('Opponent founded! \n');
        rooms[rooms.length - 2].player2?.write('Opponent founded! !\n');
    }

    socket.on('data', (data) => {
        // handle incoming data from client
    });

    socket.on('end', () => {
        // handle client disconnect
    });
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});

/* 

const PORT = 3000;

class Jogador {
    id: string;
    nome: string;
    socket: net.Socket;
    sala: Sala | null;
    position: string | null;

    constructor(id: string, nome: string, socket: net.Socket) {
        this.id = id;
        this.nome = nome;
        this.socket = socket;
        this.sala = null;
        this.position = null;
    }

    setSala(sala: Sala) {
        this.sala = sala;
    }

    removerSala() {
        this.sala = null;
        this.position = null;
    }
}


class Sala {
    jogadores: Jogador[] = [];

    adicionarJogador(jogador: Jogador) {
        this.jogadores.push(jogador);
        jogador.setSala(this);

        
        if (this.jogadores.length === 2) {
            this.iniciarJogo();
        }
    }

    removerJogador(jogador: Jogador) {
        const index = this.jogadores.indexOf(jogador);
        if (index !== -1) {
            this.jogadores.splice(index, 1);
            jogador.removerSala();
        }
    }

    enviarMensagem(mensagem: string) {
        for (const jogador of this.jogadores) {
            jogador.socket.write(mensagem);
        }
    }

    iniciarJogo() {
        this.enviarMensagem('O jogo começou!');


        
        const opcoes = ['pedra', 'papel', 'tesoura'];

        
        for (const jogador of this.jogadores) {
            jogador.socket.write('Escolha uma posição entre 0 ou 10 para atacar: ');

            jogador.socket.on('data', (data) => {
                const escolha = data.toString().trim().toLowerCase();

                if (Number(escolha) < 0 && Number(escolha) > 10) {
                    jogador.socket.write('Opção inválida. Escolha entre 0 e 10: ');
                } else {
                    jogador.position = escolha;
                    jogador.socket.write(`Você escolheu ${escolha}\n`);
                    if (this.jogadores.every(jogador => jogador.position !== null)) {
                        const jogador1 = this.jogadores[0];
                        const jogador2 = this.jogadores[1];

                        if (jogador1.position === jogador2.position) {
                            this.enviarMensagem('Empate!');
                        } else if (
                            (jogador1.position === 'pedra' && jogador2.position === 'tesoura') ||
                            (jogador1.position === 'papel' && jogador2.position === 'pedra') ||
                            (jogador1.position === 'tesoura' && jogador2.position === 'papel')
                        ) {
                            this.enviarMensagem(`${jogador1.nome} ganhou!`);
                        } else {
                            this.enviarMensagem(`${jogador2.nome} ganhou!`);

                        }

                        
                       
                    }
                }


            })
        }

    }
}


class GerenciadorSalas {
    salas: Sala[] = [];

    adicionarJogador(jogador: Jogador) {
        let salaDisponivel: Sala | null = null;

        
        for (const sala of this.salas) {
            if (sala.jogadores.length < 2) {
                salaDisponivel = sala;
                break;
            }
        }

        
        if (!salaDisponivel) {
            salaDisponivel = new Sala();
            this.salas.push(salaDisponivel);
        }

        
        salaDisponivel.adicionarJogador(jogador);
    }
}


const gerenciadorSalas = new GerenciadorSalas();


const server = net.createServer((socket) => {
    console.log('Novo jogador conectado!');

    
    const id = Math.floor(Math.random() * 1000).toString();
    const jogador = new Jogador(id, 'Jogador ' + id, socket);

    
    gerenciadorSalas.adicionarJogador(jogador);

    
    socket.on('data', (data) => {
        const mensagem = data.toString().trim();

        
        if (jogador.sala) {
            jogador.sala.enviarMensagem(`${jogador.nome}: ${mensagem}`);
        } else {
            socket.write('Você não está em uma sala.\n');
        }
    });

    socket.on('end', () => {
        console.log(`Jogador ${jogador.id} desconectado.`);
        if (jogador.sala) {
            jogador.sala.removerJogador(jogador);
        }
    });
});


server.listen(PORT, () => {
    console.log(`Servidor iniciado na porta ${PORT}.`);
});

 */