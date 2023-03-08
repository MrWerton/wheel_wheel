import net from 'net';
import readline from 'readline';

const PORT = 3000;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const client = net.createConnection({ port: PORT }, () => {
    console.log('connecting in server.');

    /*  rl.question('what's your username? ', (name) => {
         client.write(`name:${name}`);
     }); */
    rl.on('line', (data) => {
        client.write(`name:${data}`);
    });
});

client.on('data', (data) => {
    const message = data.toString().trim();
    console.log(message);
});

// Define o que fazer quando o socket é desconectado
client.on('end', () => {
    console.log('Desconectado do servidor.');
});

// Define o que fazer quando o usuário digita uma mensagem
rl.on('line', (mensagem) => {
    // Envia a mensagem para o servidor
    client.write(mensagem);
});
