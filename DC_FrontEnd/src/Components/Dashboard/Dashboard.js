import React, { useState, useEffect } from 'react'
import { Button, Card, ListGroup, Row, Col } from 'react-bootstrap';
import './Dashboard.css'
import axios from 'axios';
import Cube from './Cube';
import Moment from 'react-moment';
import { FaCube, FaExchangeAlt, FaThList } from 'react-icons/fa';
import DisplayTransactionsOfBlock from './transactionsOfBlock';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../../actions/app.action';
import { useHistory } from 'react-router-dom';
import config from '../../config/config';

const Dashboard = (props) => {
    const [blocks, setBlocks] = useState([]);
    const [show, setShow] = useState(false);
    const [view, setView] = useState(true);

    const history = useHistory();

    useEffect(() => {
        getBlocks();
    }, [])

    const getBlocks = async () => {
        const response = await axios.get(config.baseUrl + '/blocks/getBlocks');
        console.log(response.data);
        setBlocks(response.data);
    }

    const showTransactions = () => {
        setShow(true)
    }

    const changeView = () => {
        setView(!view)
    }

    return (
        <div className="Dashboard">

            <h1>Latest 5 Blocks on DChain</h1>

            <div className="divCenter textCenter">
                <h4 className="heading">Select View:</h4>
                <Button className="switch" variant="dark" onClick={changeView}><FaCube /> <FaExchangeAlt /> <FaThList /></Button>
            </div>

            {view === true && (
                <>
                    <input type="radio" id="a" label="Front" name="side" />
                    <label for="a">Block</label>
                    <input type="radio" id="b" label="Front" name="side" />
                    <label for="b">Hash</label>
                    <input type="radio" id="c" label="Front" name="side" />
                    <label for="c">Hash of previous Block</label>
                    <input type="radio" id="d" label="Front" name="side" />
                    <label for="d">Nonce</label>
                    <input type="radio" id="e" label="Front" name="side" />
                    <label for="e">Timestamp</label>
                    <input type="radio" id="f" label="Front" name="side" />
                    <label for="f">Transactions</label>
                </>
            )}

            <Row>

                {blocks.map(block => {
                    const showTransactions = () => {
                        props.actions.storeLatestBlockData(block);
                        history.push('/transactions');
                    }
                    let contentFront = <>
                        <Row>
                            <Col xs={12}>
                                <p>Block</p>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12}>
                                <p className="value">{block.id}</p>
                            </Col>
                        </Row>
                    </>;
                    let contentRight = <>
                        <Row>
                            <Col xs={12}>
                                <p>Hash</p>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12}>
                                <p className="value">{block.hash}</p>
                            </Col>
                        </Row>
                    </>;
                    let contentBack = <>
                        <Row>
                            <Col xs={12}>
                                <p>Previous Hash</p>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12}>
                                <p className="value">{block.previousHash}</p>
                            </Col>
                        </Row>
                    </>;

                    let contentLeft = <>
                        <Row>
                            <Col xs={12}>
                                <p>Nonce</p>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12}>
                                <p className="value">{block.nonce}</p>
                            </Col>
                        </Row>
                    </>;
                    let contentTop = <>
                        <Row>
                            <Col xs={12}>
                                <p>Timestamp</p>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12}>
                                <p className="time"><Moment format="MMMM Do YYYY, HH:mm:ss">{block.timestamp}</Moment></p>
                            </Col>
                        </Row>
                    </>;
                    let contentBottom = <>
                        <Row>
                            <Col xs={12}>
                                <p>Transactions</p>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12}>
                                <Button className="time" variant="link" onClick={showTransactions}>Show Transactions</Button>
                            </Col>
                        </Row>
                    </>;
                
                return (
                    
                    <>
                    {view === true && (
                        <Col md={6}>
                        <Cube 
                            front={contentFront}
                            right={contentRight}
                            back={contentBack}
                            left={contentLeft}
                            top={contentTop}
                            bottom={contentBottom}
                        />
                        
                        </Col>
                    )}
                    {view === false && (
                        <Col  xs={12} md={6} lg={4}>
                        <Card>
                            <Card.Header className="silver-background"><h2>{`Block ${block.id}`}</h2></Card.Header>
                                <ListGroup variant="flush">
                                    <ListGroup.Item>
                                        <h4>Hash</h4>
                                        <br />
                                        {block.hash}
                                    </ListGroup.Item>
                                    <ListGroup.Item>
                                        <h4>Hash of previous Block</h4>
                                        <br />
                                        {block.previousHash}
                                    </ListGroup.Item>
                                    <ListGroup.Item>
                                        <h4>Nonce</h4>
                                        <br />
                                        {block.nonce}
                                    </ListGroup.Item>
                                    <ListGroup.Item>
                                        <h4>Timestamp</h4>
                                        <br />
                                        <Moment format="MMMM Do YYYY, HH:mm:ss">{block.timestamp}</Moment>
                                    </ListGroup.Item>
                                    <ListGroup.Item>
                                    <h4>Transactions</h4>
                                    <br />
                                    <Button onClick={showTransactions}>Show Transactions</Button>
                                </ListGroup.Item>
                                </ListGroup>
                        </Card>
                        {/* {show === true ? (
                            <DisplayTransactionsOfBlock transactions={blocks.transactions} />
                        ) : null} */}
                                </Col>
                            )}
                        </>
                    )
                })}
            </Row>






        </div>
    )
}


const mapStateToProps = state => ({ applicationState: state });
const mapDispatchToProps = dispatch => ({ actions: bindActionCreators(actions, dispatch) });
export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);