
import net, {Socket} from 'net';

type Room = {
    player1?: net.Socket;
    player2?: net.Socket;
};

const rooms: Room[] = [];

function jogar(socket1: Socket, socket2: Socket) {
    
    socket1.on('data', (data) => {
      const mensagem = data.toString();
      console.log(`Jogador 1 perguntou: ${mensagem}`);
      socket2.write(`${socket1.remoteAddress} ${socket1.localPort}  ${data}`);
    });
  
    
    socket2.on('data', (data) => {
      const mensagem = data.toString();
      console.log(`Jogador 2 perguntou: ${mensagem}`);
         socket1.write(`${socket2.remoteAddress} ${socket2.localPort} ${data}`);

    });
  }
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
            joinedRoom = true;
            jogar(room.player1, room.player2);
            break;
        }
    }

    if (!joinedRoom) {
        const room = { player1: socket };
        rooms.push(room);
        socket.write('Waiting for opponent...\n');
    }

    if (rooms[rooms.length - 1].player1 && rooms[rooms.length - 1].player2) {
        rooms.push({}); 

        rooms[rooms.length - 2].player1?.write('Opponent founded! \n');
        rooms[rooms.length - 2].player1?.write('faça uma pergunta! \n');
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
