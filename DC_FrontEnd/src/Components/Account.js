import React, { useState, useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Alert from 'react-bootstrap/Alert'
import Transaction from './transaction_class';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/app.action';
import axios from 'axios';
import { io } from "socket.io-client";
import SHA256 from 'crypto-js/sha256';


function Account(props) {

    const [balance, setBalance] = useState(props.applicationState.user.balance);

    const [toAddressInput, setToAddressInput] = useState("");
    const [amount, setAmount] = useState(0);
    const [fromAddressInput, setFromAddressInput] = useState(props.applicationState.user.publicKey);

    const [variant, setVariant] = useState("success");
    const [showSuccess, setShowSuccess] = useState(false);
    const [text, setText] = useState("");
    const [transaction, setTransaction] = useState({});
    const [trig, setTrig] = useState(false)

    const [miningData, setMiningData] = useState(
        {
            merkleHash: '',
            blockID: 0,
            maxBlockID: 0,
            previousBlockHash: '',
            previousBlockNonce: 0,
            timestamp: 0,
            difficultyHash: '09'
        }
    )

    // Should contain data: userpublic key, hash, nonce
    const [foundHash, setFoundHash] = useState(
        {
            userPublicKey: '',
            hash: '',
            nonce: 0
        }
    )

    const signTransaction = async () => {
        try {
            const thisTransaction = {
                toAddress: toAddressInput,
                fromAdress: fromAddressInput,
                amount: amount

            }
            setTransaction(thisTransaction)
            console.log(thisTransaction);
            const transres = await axios.post(`http://localhost:4000/blocks/update/${fromAddressInput}`, thisTransaction);
            console.log(transres.data);
        }
        catch (err) {
            console.log('Error: ' + err)
        }
    }

    const SERVER = "http://localhost:4000";
    const socket = io(SERVER);

    useEffect(() => {
        console.log('Interval')

        socket.on('connect', () => {
            console.log(`I'm connected with the back-end`);
        });

        // establish connection with the serversame header as Server
        socket.on("sendDataForMining", (arg) => {
            console.log(arg);
            setMiningData(arg)
        });

        socket.off('connect', () => {
            console.log(`I'm connected with the back-end`);
        });
    }, [])

    useEffect(() => {
        if (!!foundHash.hash && !!foundHash.userPublicKey) {
            console.log('Send Hash: ')
            console.log(foundHash)
            socket.emit("sendHash", foundHash);
            console.log('The hash was sent')
        }
    }, [foundHash])

    useEffect(() => {

        console.log(trig)
        if (trig) {
            console.log('Initiate mining...')
            //Perform calculaptions for the hash
            console.log('Mining Data: ')
            console.log(miningData)

            let nonce = 0;
            let control = 0;
            if (!!miningData.timestamp) {
                while (!control) {
                    const tHash = SHA256(
                        miningData.merkleHash
                        + miningData.blockID
                        + miningData.previousBlockHash
                        + miningData.previousBlockNonce
                        + miningData.timestamp
                        + nonce).toString();
                    if (miningData.difficultyHash > tHash) {
                        console.log(tHash)
                        console.log(miningData.difficultyHash > tHash)
                        console.log(nonce)
                        control = 1;

                        setFoundHash({
                            userPublicKey: fromAddressInput,
                            hash: tHash,
                            nonce: nonce
                        })
                    }
                    nonce += 1
                }
            }
            console.log('End mining...')
        }
    }, [miningData, trig])

    // MISSING:
    //   1 - Display the transaction history
    //   2 - Display balance by doing a http request that updates every 10-60 sec

    return (
        <div>
            <h1>Your balance: {balance}</h1>
            <Alert variant={variant} show={showSuccess}>
                {text}
            </Alert>
            <Form>
                <Form.Group controlId="email">
                    <Form.Label>From address:<span>*</span></Form.Label>
                    <Form.Control placeholder={fromAddressInput} value={fromAddressInput}
                        type="text" required />
                    <Form.Text className="text-muted">
                        Thos is your wallet address <strong>You cannot change it, because you can only spend your own coins</strong>
                    </Form.Text>
                </Form.Group>
                <Form.Group controlId="textarea">
                    <Form.Label>To address<span>*</span></Form.Label>
                    <Form.Control value={toAddressInput} onChange={(e) => setToAddressInput(e.target.value)} required />
                    <Form.Text className="text-muted">
                        The wallet address where you want to send the money to, <strong>enter only valid addresses!</strong>
                    </Form.Text>
                </Form.Group>
                <Form.Group controlId="textarea">
                    <Form.Label>Amount<span>*</span></Form.Label>
                    <Form.Control value={amount} onChange={(e) => setAmount(e.target.value)} required />
                    <Form.Text className="text-muted">
                        Amount of money, you would like to send!
                        </Form.Text>
                </Form.Group>
                <Button onClick={signTransaction}>Create transaction</Button>
            </Form>
            <br />
            <br />
            <h4>Minning</h4>
            <br />
            <h5>Options</h5>
            <Form>
                <Form.Group controlId="nonceOption">
                    <Form.Label>Starting value for the nonce:(needs to be implemnted all his option)<span>*</span></Form.Label>
                    <Form.Control placeholder='Need to think' value={0}
                        type="text" required />
                    <Form.Text className="text-muted">
                        Type a number to <strong>start mining</strong>
                    </Form.Text>
                </Form.Group>
                <Button >Random number</Button>
                <br />
                <br />
                <Button >Each iteration a random number</Button>
                <br />
                <br />
                <Button >Save options</Button>
            </Form>
            <br />
            <h5>Do you want to mine?</h5>
            <Button onClick={() => setTrig(!trig)} >Mine</Button>
        </div>
    )
}

const mapStateToProps = state => ({ applicationState: state });
const mapDispatchToProps = dispatch => ({ actions: bindActionCreators(actions, dispatch) });
export default connect(mapStateToProps, mapDispatchToProps)(Account);