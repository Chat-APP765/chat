const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;
const messagesFile = path.join(__dirname, 'messages.json');

// Middleware
app.use(cors({ 
    origin: ['https://chat-jet-sigma-46.vercel.app', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Инициализация файла сообщений
async function initializeMessagesFile() {
    try {
        await fs.access(messagesFile);
    } catch {
        await fs.writeFile(messagesFile, JSON.stringify([]));
    }
}
initializeMessagesFile();

// Получение всех сообщений
app.get('/messages', async (req, res) => {
    console.log('GET /messages requested from:', req.get('origin'));
    try {
        const data = await fs.readFile(messagesFile, 'utf8');
        console.log('Messages from file:', data);
        res.setHeader('Content-Type', 'application/json');
        res.json(JSON.parse(data));
    } catch (err) {
        console.error('Error reading messages:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Добавление нового сообщения
app.post('/messages', async (req, res) => {
    console.log('POST /messages requested from:', req.get('origin'));
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'Message text is required' });
    }

    try {
        const data = await fs.readFile(messagesFile, 'utf8');
        const messages = JSON.parse(data);
        const newMessage = { text, timestamp: Date.now() };
        messages.push(newMessage);
        await fs.writeFile(messagesFile, JSON.stringify(messages, null, 2));
        console.log('New message added:', newMessage);
        res.setHeader('Content-Type', 'application/json');
        res.status(201).json(newMessage);
    } catch (err) {
        console.error('Error writing message:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Обработка корневого маршрута
app.get('/', (req, res) => {
    console.log('GET / requested');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Обслуживание статических файлов из папки public
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
