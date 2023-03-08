
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
    });

    socket.on('end', () => {
    });
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});
