const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;
const messagesFile = path.join(__dirname, 'messages.json');

// Middleware
app.use(cors({ origin: '*' })); // Разрешаем CORS для всех источников
app.use(express.json()); // Парсим JSON в теле запросов

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
    console.log('Получен GET запрос на /messages');
    try {
        const data = await fs.readFile(messagesFile, 'utf8');
        console.log('Данные из messages.json:', data);
        res.setHeader('Content-Type', 'application/json');
        res.json(JSON.parse(data));
    } catch (err) {
        console.error('Ошибка чтения сообщений:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Добавление нового сообщения
app.post('/messages', async (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'Текст сообщения обязателен' });
    }

    try {
        const data = await fs.readFile(messagesFile, 'utf8');
        const messages = JSON.parse(data);
        const newMessage = { text, timestamp: Date.now() };
        messages.push(newMessage);
        await fs.writeFile(messagesFile, JSON.stringify(messages, null, 2));
        console.log('Новое сообщение добавлено:', newMessage);
        res.setHeader('Content-Type', 'application/json');
        res.status(201).json(newMessage);
    } catch (err) {
        console.error('Ошибка записи сообщения:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Обработка корневого маршрута
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Обслуживание статических файлов из папки public
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
