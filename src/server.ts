import net from 'net';
import { Channel } from './channel';
import { Player } from './player';

const channels: Channel[] = [];

const server = net.createServer((socket) => {
    let channelOpened: Channel | null = null;

    for (let i in channels) {
        const channel = channels[i];
        const userWasAdded = channel.addUser(new Player(null, socket, 0));
        if (userWasAdded) {
            channelOpened = channel;
            break;
        }
    }

    if (channelOpened === null) {
        channelOpened = new Channel();
        channels.push(channelOpened);
        channelOpened.addUser(new Player(null, socket, 0));
    }

    channelOpened.startGamer();

    socket.on('data', (data) => {


    });

    socket.on('end', () => {

    });
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});
