import consola from "consola"

const url = new URL(await consola.prompt('What is the url of talk server?', { type: 'text', default: 'ws://localhost:6667' }))

const socket = new WebSocket(url)

socket.addEventListener('error', (e) => {
    consola.error('Error connecting to server!')
})

socket.addEventListener('close', () => {
    consola.warn('Disconnected from server!')
})

socket.addEventListener('open', () => {
    consola.info('Connected to server!')
})