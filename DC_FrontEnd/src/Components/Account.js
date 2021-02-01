import React, { Component } from 'react'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Alert from 'react-bootstrap/Alert'
import Transaction from './transaction_class';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../actions/app.action';
import axios from 'axios';



class Account extends Component {
    constructor(props) {
        super(props)
        this.state = {
            balance: this.props.applicationState.user.balance,
            toAddressInput: "",
            amount: 0,
            fromAddressInput: "",//should be fetched from API
            variant: "success",
            hash: "",
            timestamp: "",
            showSuccess: false,
            text: "",
            transaction: {
                toAddress: "",
                fromAdress: this.props.applicationState.user.publicKey,
                amount: 0
            },
            transactions: []
        }

    }

    // Test comment

    componentDidMount = async () => {
        try {
            const response = await axios.get('http://localhost:4000/blocks');
            const blocks = response.data
            var latestBlock = blocks.reduce(function (prev, current) {
                if (+current.id > +prev.id) {
                    return current;
                } else {
                    return prev;
                }
            });
            console.log(latestBlock);
            this.props.actions.storeLatestBlockData(latestBlock);
            this.setState({
                transactions: this.props.applicationState.block.transactions
            }, () => {
                console.log(this.state.transactions)
            })



        } catch (err) {
            console.log(err);
        }
    }

    setAddressInput = (e) => {
        const transaction = { ...this.state.transaction }
        transaction.toAddress = e.target.value;
        this.setState({
            transaction
        })
    }

    setAmountInput = (e) => {
        const transaction = { ...this.state.transaction }
        transaction.amount = e.target.value;
        this.setState({
            transaction
        })
    }

    setTransactionState = () => {
        this.setState({
            transactions: [...this.state.transactions, this.state.transaction]
        }, () => {
            console.log(this.state.transactions)
        })
    }


    signTransaction = async () => {

        this.setTransactionState();

        try {
            const block = {
                id: this.props.applicationState.block.id,
                hash: this.props.applicationState.block.hash,
                previousHash: this.props.applicationState.block.previousHash,
                nonce: this.props.applicationState.block.nonce,
                timestamp: this.props.applicationState.block.timestamp,
                transactions: this.state.transactions
            }
            console.log(block);
            const transres = await axios.post(`http://localhost:4000/blocks/update/${this.props.applicationState.block._id}`, block);
            console.log(transres.data);


        }
        catch (err) {
            console.log('Error: ' + err)
        }


        // })


    }




    //ComponentDidMount to display the transaction history
    render() {
        return (
            <div>
                <h1>Your balance: {this.state.balance}</h1>
                <Alert variant={this.state.variant} show={this.state.showSuccess}>
                    {this.state.text}
                </Alert>
                <Form>
                    <Form.Group controlId="email">
                        <Form.Label>From address:<span>*</span></Form.Label>
                        <Form.Control placeholder={this.props.applicationState.user.publicKey} value={this.props.applicationState.user.publicKey}
                            onChange={this.setFromAddressInput} type="text" required />
                        <Form.Text className="text-muted">
                            Thos is your wallet address <strong>You cannot change it, because you can only spend your own coins</strong>
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="textarea">
                        <Form.Label>To address<span>*</span></Form.Label>
                        <Form.Control value={this.state.transaction.toAddress} onChange={this.setAddressInput} required />
                        <Form.Text className="text-muted">
                            The wallet address where you want to send the money to, <strong>enter only valid addresses!</strong>
                        </Form.Text>
                    </Form.Group>
                    <Form.Group controlId="textarea">
                        <Form.Label>Amount<span>*</span></Form.Label>
                        <Form.Control value={this.state.transaction.amount} onChange={this.setAmountInput} required />
                        <Form.Text className="text-muted">
                            Amount of money, you would like to send!
                        </Form.Text>
                    </Form.Group>
                    <Button onClick={this.signTransaction}>Create transaction</Button>
                </Form>
            </div>
        )


    }
}

const mapStateToProps = state => ({ applicationState: state });
const mapDispatchToProps = dispatch => ({ actions: bindActionCreators(actions, dispatch) });
export default connect(mapStateToProps, mapDispatchToProps)(Account);