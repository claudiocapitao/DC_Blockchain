import React, { useState, useEffect } from 'react'
import { Button, Card, ListGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';


const Dashboard = (props) => {
    const [blocks, setBlocks] = useState([]);

    useEffect(() => {
        getBlocks();
    }, [])

    const getBlocks = async () => {
        const response = await axios.get('http://localhost:4000/blocks/getBlocks');
        console.log(response.data);
        setBlocks(response.data);
    }

    return (
        <div>
            <h1>Blocks on DC chain</h1>
            <p> The latest 5 blocks on the chain: </p>
            {blocks.map(block => {
                return (<Card style={{ width: '18rem' }}>
                    <Card.Header><h2>{`Block ${block.id}`}</h2></Card.Header>
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
                            {block.timestamp}
                        </ListGroup.Item>
                    </ListGroup>
                </Card>)
            })}

        </div>
    )
}


export default Dashboard;