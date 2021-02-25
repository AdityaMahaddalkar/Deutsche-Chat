import React,{ Component, useCallback,useEffect } from 'react';
import { Text,View } from 'react-native'
import ChatBotComponent from './chatbot'

export default class DeutscheChat extends Component {

    constructor(props){
        super(props)

        this.state = { 
            data: "",

            steps: [
                {
                    id: 'hi',
                    message: 'Hi,' + props.user,
                    trigger: 'menu',
                },
                {
                    id: 'menu',
                    options: [
                        { value: "posts", label: 'Balance', trigger: this.getData },
                        { value: "users", label: 'Account Statement', trigger:this.getData },
                        { value: "users", label: 'Forms', trigger: this.getData },
                    ],
                },
                {
                    id: '3',
                    message: ""+this.data,
                    trigger: "menu"
                },
            ]
        }
    }

    getData = ( {value ,steps} ) => {

        
        const response = fetch('https://jsonplaceholder.typicode.com/posts/1')
            .then(response => response.json)
            .then(json => this.setState({data: json.id}))
            .catch((error) => console.error(error))
        
        console.log(response)
        return "3"
            
    }
    
    render(){
        
        const steps = this.state.steps
        return(
            <View>
                <ChatBotComponent steps={steps}/>
            </View>        
        );
    }
};