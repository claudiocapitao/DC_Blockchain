const express = require('Express');
const mongoose = require('mongoose');
const cors = require('cors');
const SHA256 = require('crypto-js/sha256');
let Block = require('./models/block.model');
let DCWallet = require('./models/DCWallet.model');
let User = require('./models/user.model')

const uri = process.env.ATLAS_URI;
mongoose.connect('mongodb+srv://user:user@cluster0.xab4r.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
    , { useNewUrlParser: true, useCreateIndex: true }
);

const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB database connection established successfully");
})

const app = express();
const port = process.env.PORT || 4000;

require('dotenv').config();

app.use(express.json());
app.use(cors());

const blockRouter = require('./routes/block');
const UserRouter = require('./routes/user');
const DCWalletRouter = require('./routes/DC');


app.use('/blocks', blockRouter);
app.use('/users', UserRouter);
app.use('DCWallet', DCWalletRouter);



const genesisFunction = async () => {

    const block = await Block.aggregate([{ $sort: { id: -1 } }, { $limit: 1 }])
    if (!block.length) {
        // Current timestamp

        // Create hash from message in transactions + timestamp + random nounce

        const DCGenesisWallet = {
            balance: 10000000
        }

        const newDCWallet = new DCWallet(DCGenesisWallet);
        newDCWallet.save();

        // Create genesis block
        const firstBlock = {
            id: Number(0),
            hash: 'First',
            previousHash: 'null',
            nonce: Number(0),
            timestamp: Date.parse('2020-02-01T23:00:00.000Z'),
            transactions: ['The start...']
        }
        const newBlock = new Block(firstBlock)
        newBlock.save();
    }
}

genesisFunction()

// Receiving transactions data and sending data to variables
// MISSING:
//   1 - Verify if user has enough balance to perform transaction

let transA = [];
let transAHashes = [];
let newTransA = {}
let transB = [];
let transBHashes = [];
let newTransB = {}


//get request for the balance



app.post("/blocks/update/:address", async (req, res) => {
    console.log('############################### New transaction')
    const publicAddress = req.params.address;
    const users = await User.find()

    let withdrawUser = "";
    for (var i = 0; i < users.length; i++) {
        if (users[i].publicKey === publicAddress) {
            withdrawUser = users[i];
        }
    }

    let depositUser = "";
    for (var i = 0; i < users.length; i++) {
        if (users[i].publicKey === req.body.toAddress) {
            depositUser = users[i]
        }
    }

    // calculate 
    const timestampNow = Date.now()
    const tHash = SHA256(req.body.toAddress + req.body.fromAdress + req.body.amount + timestampNow).toString();
    const newTrans = { ...req.body, hash: tHash, timestamp: timestampNow }
    console.log(newTrans)
    transA = [...transA, newTrans]
    transAHashes = [...transAHashes, tHash]
    res.status(200)
    res.json(depositUser);

    console.log('###############################')
});


//Merkle tree for even number of elements
const merkleTreeHash = (a, previousHash) => {

    console.log(a)
    let b = []
    // if there are no hashes
    if (a.length === 0) {
        console.log(SHA256('0').toString());
        return SHA256(previousHash).toString();
    }
    else if (a.length === 1) {
        console.log(a[0])
        return a[0]
    }
    // uneven numbers
    // 7
    else if (a.length % 2 !== 0) {
        // length -1 because you want to have even number as length
        for (let i = 0; i < a.length - 1; i += 2) {
            // more than 3 hashes ==> hash the two hashes together
            if (a.length - i > 3) {
                b.push(SHA256(a[i] + a[i + 1]).toString())
                // if there are 3 hashes left
            } else {
                // 3 hashes tranform to 2 hashes
                b.push(SHA256(a[i] + a[i + 1]).toString())
                b.push(SHA256(a[i + 2]).toString())
                console.log(b)
            }
        }
        // call rekursive function
        return merkleTreeHash(b)
    }

    // two hashes
    else if (a.length == 2) {
        console.log(a)
        console.log(b)
        console.log(SHA256(a[0] + a[1]).toString())
        b.push(SHA256(a[0] + a[1]).toString())
        return merkleTreeHash(b)

        // even higher than two
    } else {
        for (let i = 0; i < a.length; i += 2) {
            b.push(SHA256(a[i] + a[i + 1]).toString())
        }
        console.log(b)
        return merkleTreeHash(b)
    }
}

// Create block - search for previous blockto get lats block number
// Create hash, timestamp and merkle tree for new block
// when 10 min are over this data is compiled and sent for saving

const httpServer = require('http').createServer(app);

const io = require("socket.io")(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connect', (socket) => {
    console.log('New client connected');
});


let dataToMine = {}
// block the next user in 10 minutes to mine new blocks 
let serverCreatesTheBlock = true;
// turns false if user mined the block and creates after that a new block

// MISSING:
//   1 - Decide what to do with second block block - mining parametters

setInterval(() => {
    console.log('---- START - setInterval ----')
    // all the transactions in this intervall goes to transB, 
    transB = [...transA];
    transBHashes = [...transAHashes]
    // reset transA 
    transA = [];
    transAHashes = []




    console.log('Switch in transactions is over')

    const myfunc = async () => {

        const timestamp = new Date().getTime();
        console.log(timestamp);

        const block = await Block.aggregate([{ $sort: { id: -1 } }, { $limit: 1 }])
        const maxBlockID = await (block[0].id + 1)
        const previousBlockHash = await block[0].hash
        const previousBlockNonce = await block[0].nonce
        console.log(maxBlockID)
        const merkleHash = merkleTreeHash(transBHashes, previousBlockHash);
        console.log(merkleHash)

        dataToMine = {
            merkleHash,
            blockID: maxBlockID,
            previousBlockHash,
            previousBlockNonce,
            timestamp,
            // get hashnumber 
            difficultyHash: '005'
        }

        //sends data to the frontend
        io.emit("sendDataForMining", dataToMine);

        console.log(serverCreatesTheBlock)
        if (serverCreatesTheBlock) {
            console.log('Server creates the block: true')
            const nextBlock = {
                id: Number(maxBlockID),
                hash: merkleHash,
                previousHash: previousBlockHash,
                nonce: Number(1),
                timestamp,
                transactions: transB
            }
            const newBlock = new Block(nextBlock);
            newBlock.save();
        }

        serverCreatesTheBlock = true

        console.log('---- END - setInterval ----')
    }
    myfunc()

}, 100000)

io.on("connection", (socket) => {
    console.log('Connection')
    socket.once("sendHash", (testUserFoundHash) => {
        console.log('Hash: ')
        console.log(testUserFoundHash);

        const redoUserHash = SHA256(
            dataToMine.merkleHash
            + dataToMine.blockID
            + dataToMine.previousBlockHash
            + dataToMine.previousBlockNonce
            + dataToMine.timestamp
            + testUserFoundHash.nonce).toString();
        console.log(redoUserHash)
        console.log(testUserFoundHash.hash)
        console.log(redoUserHash == testUserFoundHash.hash)

        // Confirm hash found by user
        console.log('serverCreatesTheBlock: ' + serverCreatesTheBlock)
        if (redoUserHash == testUserFoundHash.hash && serverCreatesTheBlock) {
            console.log('Server creates the block: false')
            console.log('serverCreatesTheBlock: ' + serverCreatesTheBlock)
            const nextBlock = {
                id: dataToMine.blockID,
                hash: redoUserHash,
                previousHash: dataToMine.previousBlockHash,
                nonce: testUserFoundHash.nonce,
                timestamp: dataToMine.timestamp,
                transactions: transB
            }

            const newBlock = new Block(nextBlock);
            newBlock.save();
            serverCreatesTheBlock = false
        }

        //Tell all users that someone has found the


        //send coins to user that mined - in form of a transaction

    });
});

app.get('/', (req, res) => {
    res.send('Hello World')
})

httpServer.listen(port, () => {
    console.log(`Server is running on ${port}`);
})
