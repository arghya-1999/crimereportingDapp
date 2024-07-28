const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/crime-reporting', { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    email: String,
    name: String,
    profile: {
        age: Number,
        address: String
    }
});

const User = mongoose.model('User', userSchema);

app.post('/api/user', async (req, res) => {
    const { email, name, profile } = req.body;
    const user = new User({ email, name, profile });
    await user.save();
    res.status(201).send(user);
});

app.get('/api/user/:email', async (req, res) => {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).send('User not found');
    res.send(user);
});

app.put('/api/user/:email', async (req, res) => {
    const user = await User.findOneAndUpdate({ email: req.params.email }, req.body, { new: true });
    if (!user) return res.status(404).send('User not found');
    res.send(user);
});

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

httpServer.listen(3000, () => {
    console.log('Server is running on port 3000');
});
