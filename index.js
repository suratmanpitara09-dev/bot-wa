const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const P = require('pino')

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth')
    const sock = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state
    })
    sock.ev.on('creds.update', saveCreds)
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut
            if(shouldReconnect) startBot()
        } else if(connection === 'open') {
            console.log('BOT KONEK!')
        }
    })
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0]
        if(!m.message || m.key.fromMe) return
        const text = m.message.conversation || m.message.extendedTextMessage?.text || ''
        const from = m.key.remoteJid
        if(text.toLowerCase() === 'ping') {
            await sock.sendMessage(from, { text: 'Pong! 🏓 Bot aktif bro!' })
        } else if(text.toLowerCase() === 'halo') {
            await sock.sendMessage(from, { text: 'Halo juga! Ketik ping' })
        } else {
            await sock.sendMessage(from, { text: `Lu: ${text}\nKetik ping bro` })
        }
    })
}
startBot()

