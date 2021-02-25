import React,{ Component, useCallback,useEffect } from 'react';
import { Text,View } from 'react-native'
import ChatBot from 'react-native-chatbot'

export default class DeutscheChat extends Component {

    constructor(props){
        super(props)

        this.state = { 

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
                        { value: "users1", label: 'Forms', trigger: this.getData },
                    ],
                },
                {
                    id: 'data',
                    message: "abc" ,
                    trigger: "menu"
                },
            ]
        }
    }

    getData = ( {value ,steps} ) => {

        key = "data"
        
        fetch('https://jsonplaceholder.typicode.com/posts/1')
            .then(response => response.json())
            .then(json => {

                this.setState(prevState => ({

                    steps: prevState.steps.map(
                      el => el.id === key? { ...el, message : json.id }: el
                    )
            }))
        })
            .catch((error) => console.error(error))
        
        return key
            
    }
    
    render(){

        console.log(this.state.steps)
        
        return(
                <ChatBot steps={this.state.steps}/>  
        );
    }
};