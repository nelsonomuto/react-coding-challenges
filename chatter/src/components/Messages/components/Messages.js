import React, { useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import useSound from 'use-sound';
import config from '../../../config';
import LatestMessagesContext from '../../../contexts/LatestMessages/LatestMessages';
import TypingMessage from './TypingMessage';
import Header from './Header';
import Footer from './Footer';
import Message, { ME } from './Message';
import defaultMsg from '../../../common/constants/initialBottyMessage';
import '../styles/_messages.scss';

const socket = io(config.BOT_SERVER_ENDPOINT, {
  transports: ['websocket', 'polling', 'flashsocket']
});

function Messages() {
  const defaultMessage = {
    id: 0,
    user: 'Botty',
    message: defaultMsg
  };
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([defaultMessage]);
  const { setLatestMessage } = useContext(LatestMessagesContext);

  const sendMessage = () => {
    socket.emit('user-message', message);
    addMessage({ user: ME, message, botTyping: false });
    setMessage('');
  };
  const onChangeMessage = (e) => {
    setMessage(e.target.value);
  };

  const addMessage = (newMessageObj) => {
    const newMessages = [...messages];
    if (newMessageObj.user === 'Botty' && !newMessageObj.botTyping) {
      setLatestMessage('bot', newMessageObj.message);
    }
    newMessages.push({ id: newMessages.length, ...newMessageObj });
    setMessages([...newMessages]);
  };

  socket.on('bot-typing', (message) => {
    // * - `bot-typing`: Emitted by Botty when they are typing in response to a user message.
    console.log('bot-typing', { user: 'Botty', message, botTyping: true });
    addMessage({ user: 'Botty', message: '...', botTyping: true });
  });
  socket.on('bot-message', (message) => {
    // - `bot-message`: Emitted by Botty with a message payload in response to a user message.
    console.log('bot-message', { message, botTyping: false });
    addMessage({ user: 'Botty', message, botTyping: false });
  });

  // const [playSend] = useSound(config.SEND_AUDIO_URL);
  // const [playReceive] = useSound(config.RECEIVE_AUDIO_URL);

  return (
    <div className="messages">
      <Header />
      <div className="messages__list" id="message-list">
        {messages.map((msg) => (
          <Message nextMessage={{ user: msg.user }} message={msg} botTyping={msg.botTyping} />
        ))}
      </div>
      <Footer message={message} sendMessage={sendMessage} onChangeMessage={onChangeMessage} />
    </div>
  );
}

export default Messages;
