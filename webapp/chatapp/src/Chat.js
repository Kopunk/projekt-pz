import './Chat.css';
import React, { useCallback, useEffect } from 'react';
import useWebSocket from 'react-use-websocket'
import { TextField, Button } from '@mui/material';
import Messages from './components/Messages';
import { Buffer } from 'buffer';
const axios = require('axios').default;

function Chat() {
  const [messageValue, setMessageValue] = React.useState('');
  const [messages, setMessages] = React.useState([])

  const WS_PORT = 80
  const roomName = btoa(window.location.pathname.split('/')[2])
  const author = localStorage.getItem('author')
  // const socketUrl = `ws://${window.location.hostname}:${WS_PORT}/ws/${roomName}?username=${author}`
  const socketUrl = `ws://chatapp.westeurope.cloudapp.azure.com:${WS_PORT}/ws/${roomName}?username=${author}`

  const {
    sendMessage,
    // sendJsonMessage,
    // lastMessage,
    // readyState,
    // getWebSocket,
    lastJsonMessage,
  } = useWebSocket(socketUrl, {
    onOpen: () => console.log('Opened'),
    // onMessage: onMessageHandler,
    onClose: (e) => console.log("Closed:", e),
    onError: (e) => console.log("Error:", e),
    //Will attempt to reconnect on all close events, such as server shutting down
    shouldReconnect: (closeEvent) => true,
    reconnectInterval: 3000,
  });

  const handleKeyClick = (e) => {
    if (e.key === 'Enter')
    {
      handleClickSendMessage()
    }
  }

  const handleClickSendMessage = useCallback(() => {
    if (messageValue.trim() === '')
    {
      document.getElementById("standard-multiline-static").focus()
      return
    }
    let message = {
      message: Buffer.from(messageValue, 'utf-8').toString('base64'),
    }
    message = JSON.stringify(message)
    sendMessage(message)
    console.log("Sending: ", message)
    setMessageValue('')
    document.getElementById("standard-multiline-static").focus()
    
  }, [messageValue, sendMessage, setMessageValue])


  const handleMessageChange = (event) => {
    setMessageValue(event.target.value)
  }

  const getPreviousMessages = (last_message = null) => {
    let request_path = ''
    if (last_message === null)
    {
      request_path = `/${roomName}`
    }
    else 
    {
      request_path = `/${roomName}?message_id=${last_message}}`
    }
    axios.get(request_path)
    .then((response) => {
      setMessages((prev) => prev.concat(response.data.messages))
    })
  }

  const handleScroll = (e) => {
    const top = e.target.scrollHeight - e.target.scrollTop === e.target.scrollHeight;
    if (top)
    {
      console.log(messages)
      getPreviousMessages(messages[messages.length-1].message_no)
    }
  }


  useEffect(() => {
    if (lastJsonMessage !== null) {
      setMessages((prev) => [lastJsonMessage].concat(prev));
    }
    
  }, [lastJsonMessage, setMessages]);

  useEffect(()=>{
    getPreviousMessages()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  

  return (
    <div className='main-container'>
      <div className='top-container'>
        <div className='chat-box'>
            <Messages messages={messages} author={author} handleScroll={handleScroll}></Messages>
        </div>
      </div>
      <div className='bottom-container'>
        <div className='message-box-container'>
          <TextField
                    className='message-text'
                    id="standard-multiline-static"
                    label="Message"
                    multiline
                    required
                    rows={5}
                    variant="outlined"
                    value={messageValue}
                    onKeyUp={handleKeyClick}
                    onChange={handleMessageChange}
                />
        </div>
        <div className='send-message-button-container'>
          <Button
            sx={{fontSize: '300%'}}
            className='send-message-button' 
            variant="contained" 
            onClick={handleClickSendMessage}>
              Send
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
