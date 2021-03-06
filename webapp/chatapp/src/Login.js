import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { Button } from '@mui/material';
import './Login.css'

export default function Login() {
    const [roomNameValue, setRoomNameValue] = React.useState('');
    const [userNameValue, setUserNameValue] = React.useState('');

    const handleRoomNameChange = (event) => {
        setRoomNameValue(event.target.value);
    };

    const handleUserNameChange = (event) => {
        setUserNameValue(event.target.value);
    };

    const connectToRoom = () => {
        if (roomNameValue.trim() === '' || userNameValue.trim() === '')
            return
        localStorage.setItem('author', userNameValue.trim())
        window.location.href = `chat/${roomNameValue}`
    }

    return (
        <Box
            sx={{
                display:"flex",
                flexFlow:"column",
                justifyContent:"center",
                alignItems:"center",
                gap:"0.5rem",
            }}
            noValidate
            autoComplete="off"
            className="login-box"
        >
            <div className='width'>
                <TextField
                    sx={{width: "100%"}}
                    required
                    id="outlined-required"
                    label="Nick"
                    value={userNameValue}
                    onChange={handleUserNameChange}

                />
            </div>
            <div className='width'>
                <TextField
                    sx={{width: "100%"}}
                    id="standard-multiline-static"
                    label="Room name"
                    multiline
                    required
                    rows={4}
                    variant="outlined"
                    value={roomNameValue}
                    onChange={handleRoomNameChange}
                />
            </div>
            <Button className='submit-button width' variant="contained" onClick={connectToRoom}>Join room</Button>
        </Box>
    );
}
