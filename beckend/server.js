const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config();
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const cors = require('cors');
const path = require('path');
const colors = require('colors');

const PORT = process.env.PORT || 1000;
const NODE_ENV = process.env.NODE_ENV || 'production';

const app = express();
connectDB();

app.use(express.json());

// app.get('/', (req, res) => {
//     res.send('API is running successfully');
// });

app.use(cors({ origin: '*' }))

app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);

//--------Deployment Code--------//

const __dirname1 = path.resolve();
if(NODE_ENV === 'production'){
    app.use(express.static(path.join(__dirname1, '/frontend/build')));
    app.get('*', (req, res) => {res.sendFile(path.resolve(__dirname1, 'frontend', 'build', 'index.html'))});
}
else{
    app.get('/', (req, res) => {
        res.send('API is running....');
    });
}


//--------Deployment Code--------//

app.use(notFound);
app.use(errorHandler);


const server = app.listen(PORT, () => {
    console.log('server started on port', PORT);
});

const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: 'http://localhost:3000',
        // origin: 'https://small-talks-c376.onrender.com',
    },
});


// Mapping User Id to Socket ID
const clients = {}

io.on('connection', (socket) => {
    socket.on('setup', (userData) => {
        socket.join(userData._id);
        socket.emit('connected');
    });

    socket.on('join chat', (room) => {
        socket.join(room);
    });

    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));
    
    socket.on("storeMe", ({userId,socketId}) => {
        clients[userId] = socketId;
    });


    socket.on("new message", (newMessageRecieved) => {
        var chat = newMessageRecieved.chat;
        if (!chat.users) {
            return console.log('chat.users not defined')
        }

        chat.users.forEach(user => {
            if (user._id == newMessageRecieved.sender._id) return;
            socket.in(user._id).emit("message recieved", newMessageRecieved);
        })
    })

    // Video Chat Code

    socket.emit('me', socket.id);

    socket.on('disconnect',()=>{
        for (const userId in clients) {
        if (clients[userId] === socket.id) {
            io.to(socket.id).emit('callEnded');
            delete clients[userId];
            break;
        }
    }
    });

    socket.on("callUser",({userToCall,signalData,from,name})=>{
        const userSocketId = clients[userToCall];
        io.to(userSocketId).emit("callUser" ,{signal:signalData,from,name})
    });


    socket.on("answerCall",(data)=>{
        io.to(data.to).emit("callAccepted",data.signal)
    })

    socket.on("callEnded",(id)=>{

        if(clients[id]){
            io.to(clients[id]).emit("callEnded");
        }
        else{
            io.to(id).emit("callEnded");
        }
    })
    // Video Chat Ends



    socket.off("setup", () => {
        socket.leave(userData._id);
    })
});


