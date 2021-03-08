import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../../actions/app.action';
import Moment from 'react-moment';
import './transactionsOfBlock.css';
import Icon from '../../Logo/DCoinIconColor.svg';


const DisplayTransactionsOfBlock = (props) => {
    const transactions = props.applicationState.block.transactions;
    //test
    return (
        <div className="ToB">

            <h1>Transactions of the {props.applicationState.block.id} block</h1>
            <table>
                <thead>
                    <tr>
                        <th>From</th>
                        <th>To</th>
                        <th>Amount</th>
                        <th>Hash</th>
                        <th>Timestamp</th>

                    </tr>
                </thead>
                <tbody>
                    {transactions.map(transaction => {
                        return (
                            <tr>
                                {(transaction.fromAdress === "DCWallet") ?
                                    (     
                                        <td className="DCWallet">
                                            <span>DC</span>
                                            <span>Wallet</span>
                                        </td>
                                    ) : <td className="KeyNumber">transaction.fromAdress</td>
                                }
                                <td className="KeyNumber">{transaction.toAddress}</td>
                                <td className="amount"><img src={Icon} alt="DC"/>{transaction.amount}</td>
                                <td className="KeyNumber">{transaction.hash}</td>
                                <td><Moment format="DD/MM/YYYY HH:mm">{transaction.timestamp}</Moment></td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

        </div>
    )
}



const mapStateToProps = state => ({ applicationState: state });
const mapDispatchToProps = dispatch => ({ actions: bindActionCreators(actions, dispatch) });
export default connect(mapStateToProps, mapDispatchToProps)(DisplayTransactionsOfBlock);