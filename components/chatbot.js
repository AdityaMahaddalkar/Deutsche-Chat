import ChatBot from 'react-native-chatbot';
import React from 'react';
import { useEffect } from 'react';

export default function ChatBotComponent( props) {
    
    return (
        <ChatBot steps={props.steps} />
    )
}