import React, { Component } from 'react'
import { Button, Alert, Form, Row, Col } from 'react-bootstrap';
import User from '../class';
import BlockchainAPI from '../BlockchainAPI';
import axios from 'axios';
import './CreateKeys.css';
import { Link } from 'react-router-dom';
// import Typewriter from 'typewriter-effect';
import Typewriter from 'typewriter-effect/dist/core';

class CreateKeys extends Component {

    constructor(props) {
        super(props)
        this.state = {
            publicKey: "",
            privateKey: "",
            showButton: false,
            showAlert: false,
            variant: "warning",
            balance: 100,
            walletName: "",
            text: "",
            created: false

        }
        this.user = User;
        this.api = BlockchainAPI;
        // this.inputRef = React.createRef();
    }


    setWalletName = (e) => {
        const wallet = e.target.value;
        this.setState({
            walletName: wallet
        })
    }


    generateKeys = async () => {

        const EC = require('elliptic').ec;
        const ec = new EC('secp256k1');
        const key = ec.genKeyPair();

        if (this.state.walletName !== "") {
            setTimeout(async () => {
                this.setState({
                    publicKey: key.getPublic('hex'),
                    privateKey: key.getPrivate('hex'),
                    showButton: true,
                    showAlert: true,
                    text: "Your public and private Key are unique. Make sure to store them safely. If you are losing one of them, you will never be able to access your account again!!!",
                    created: true
                })
                const user = {
                    publicKey: this.state.publicKey,
                    privateKey: this.state.privateKey,
                    balance: this.state.balance,
                    walletName: this.state.walletName
                }

                try {
                    const response = await axios.post('http://localhost:4000/users/add', user);
                    console.log(response.data);
                } catch (err) {
                    console.log('Error: ' + err)
                }



            }, 100)

        } else {
            this.setState({
                showAlert: true,
                text: "Please provide a wallet name"
            })
        }
    

    }

    // type = () =>{
    //     return(
    //         <Typewriter
    //             options={{
    //                 strings: ["BigPapaJoe's Wallet", "My New Car", "$crooge McDuck's Money Bin", "College Fund", "Piggy Bank", "Backpack Trip", "I'll be rich"],
    //                 autoStart: true,
    //                 loop: true,
    //             }}
    //         />
    //     )
    // }

    render() {

        // var customNodeCreator = function(character) {
        //     // Add character to input placeholder
        //     this.inputRef.current.placeholder = this.inputRef.current.placeholder + character;
           
        //     // Return null to skip internal adding of dom node
        //     return null;
        //   }
           
        //   var onRemoveNode = function({ character }) {
        //     if(this.inputRef.current.placeholder) {
        //       // Remove last character from input placeholder
        //       this.inputRef.current.placeholder = this.inputRef.current.placeholder.slice(0, -1)
        //     }
        //   }
           
        //   var typewriter = new Typewriter(null, {
        //     loop: true,
        //     delay: 75,
        //     onCreateTextNode: customNodeCreator,
        //     onRemoveNode: onRemoveNode,
        //   });
           
        //   typewriter
        //     .typeString('A simple yet powerful native javascript')
        //     .pauseFor(300)
        //     .start();

        return (
            <>
            <div className="keys">
            </div>
                <div className="foreground">

                <h1>Register</h1>
                
                <br/>
                <Form.Group controlId="textarea">
                    <Form.Label><strong>Wallet Name</strong><span>*</span></Form.Label>

                    {this.state.created===false ?

                    <>
                        <Form.Control value={this.state.walletName} onChange={this.setWalletName}  required />
                        {/* <Form.Control value={this.state.walletName} onChange={this.setWalletName}  ref={this.inputRef.current} required /> */}

                        <Form.Text className="text-muted">
                            Please place a Wallet Name here, your keys will be generated by us!
                        </Form.Text>
                    </>
                    
                    :
                    
                    <Form.Control value={this.state.walletName} disabled />

                    }

                    
                </Form.Group>
                {this.state.created && (
                    <>
                        <Alert variant={this.state.variant} show={this.state.showAlert}>
                        {this.state.text}
                        </Alert>

                        <Row>
                            <Col md={4}>
                                <p><strong>Your public key: </strong></p>
                            </Col>
                            <Col md={8}>
                                <p className="key">{this.state.publicKey}</p>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={4}>
                                <p><strong>Your private key: </strong></p>
                            </Col>
                            <Col md={8}>
                                <p className="key">{this.state.privateKey}</p>
                            </Col>
                        </Row>
                    </>
                )}
                
                {this.state.created===false ?
                <Button
                    onClick={this.generateKeys}
                    disabled={this.state.showButton}
                >
                    Generate Wallet
                </Button>
                : null }
                
                <Link to="/login" >
                    <Button variant="outline-dark">
                        Return to Login
                    </Button>
                </Link>    
                
                </div>
            </>
        )
    }

}

export default CreateKeys; 