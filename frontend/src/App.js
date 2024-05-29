import React from 'react';
import { Route } from 'react-router-dom';
import Homepage from './Pages/homepage';
import chatPage from './Pages/chatPage';
import './App.css';


function App() {
    return (
        <div className='App'>
            <Route path='/' component={Homepage} exact/>
            <Route path='/chats' component={chatPage} exact/>
        </div>
    );
    }

export default App;

