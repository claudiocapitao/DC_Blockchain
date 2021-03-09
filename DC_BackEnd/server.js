const express = require('Express');
const bodyParser = require("body-parser");
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
app.use(bodyParser.json());

const blockRouter = require('./routes/block');
const UserRouter = require('./routes/user');
const DCWalletRouter = require('./routes/DC');
const LoginRouter = require('./routes/login');
const { findById } = require('./models/block.model');
const { verify } = require('jsonwebtoken');

app.use('/blocks', blockRouter);
app.use('/users', UserRouter);
app.use('/DCWallet', DCWalletRouter);
app.use('/login', LoginRouter);


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
            transactions: [],
            merkleHash: 'null',
            transactionsMined: true,
            transactionHashes: []
        }
        const newBlock = new Block(firstBlock)
        newBlock.save();
    }
}

genesisFunction()





let transA = [];
let transAHashes = [];
let newTransA = {}
let transB = [];
let transBHashes = [];
let newTransB = {}






app.post("/blocks/update/:address", async (req, res) => {
    console.log('############################### New transaction')
    const publicAddress = req.params.address;
    const amount = parseInt(req.body.amount, 10);;
    try {
        const users = await User.find();

        let withdrawUser = "";
        for (var i = 0; i < users.length; i++) {
            if (users[i].publicKey === req.body.fromAdress) {
                withdrawUser = users[i];
            }
        }

        let withdrawBalance = withdrawUser.balance;

        let depositUser = "";
        for (var i = 0; i < users.length; i++) {
            if (users[i].publicKey === req.body.toAddress) {
                depositUser = users[i]
            }
        }
        if (depositUser !== "") {
            let depositBalance = depositUser.balance;

            // calculate 
            if (amount > withdrawBalance) {
                res.json('invalid transaction');
            } else {
                withdrawBalance = withdrawBalance - amount;
                depositBalance = depositBalance + amount;
            }

            User.findById(withdrawUser._id)
                .then(user => {
                    user.publicKey = withdrawUser.publicKey;
                    user.privateKey = withdrawUser.privateKey;
                    user.balance = withdrawBalance;


                    user.save()
                        .then(() => res.json(user))
                        .catch(err => res.status(400).json('Error: ' + err));
                })
                .catch(err => res.status(400).json('Error: ' + err));


            User.findById(depositUser._id)
                .then(user => {
                    user.publicKey = depositUser.publicKey;
                    user.privateKey = depositUser.privateKey;
                    user.balance = depositBalance;


                    user.save()

                })
                .catch(err => res.status(400).json('Error: ' + err));


            const timestampNow = Date.now()
            const tHash = SHA256(req.body.toAddress + req.body.fromAdress + req.body.amount + timestampNow).toString();
            const newTrans = { ...req.body, hash: tHash, timestamp: timestampNow }
            console.log(newTrans)
            transA = newTrans
            transAHashes = tHash
            res.status(200)
            res.json(withdrawUser)


            const block = await Block.aggregate([{ $sort: { id: -1 } }, { $limit: 1 }]);
            const latestBlock = block[0];

            Block.findById(latestBlock._id)
                .then(block => {
                    block.id = latestBlock.id,
                        block.hash = latestBlock.hash,
                        block.previousHash = latestBlock.previousHash,
                        block.nonce = latestBlock.nonce,
                        block.timestamp = latestBlock.timestamp,
                        block.transactions = [...latestBlock.transactions, transA]
                    block.merkleHash = latestBlock.merkleHash,
                        transactionsMined = latestBlock.transactionsMined
                    block.transactionHashes = [...latestBlock.transactionHashes, transAHashes]
                    block.save()

                }

                )
        } else {
            res.json('The deposit address is not stored on our blockchain!');
        }


    } catch (err) {
        console.log(err)
    }


    console.log('###############################')
});


//Merkle tree for even number of elements
const merkleTreeHash = (a) => {

    console.log(a)
    let b = []
    // if there are no hashes
    if (a.length === 0) {
        console.log(SHA256('0').toString());
        return SHA256('0').toString();
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

let serverCreatesTheBlock = false;





const myfunc = async (hashParam, nonceParam, transaction, transactionHashes) => {
    transBHashes = [...transAHashes]
    transAHashes = []

    const timestamp = Date.now();
    console.log(timestamp);

    const block = await Block.aggregate([{ $sort: { id: -1 } }, { $limit: 1 }])
    const maxBlockID = await (block[0].id + 1)
    const previousBlockHash = await block[0].hash
    const previousBlockNonce = await block[0].nonce
    console.log(maxBlockID)
    const merkleHash = merkleTreeHash(transBHashes, previousBlockHash);
    console.log(merkleHash)

    const nextBlock = {
        id: Number(maxBlockID),
        hash: hashParam,
        previousHash: previousBlockHash,
        nonce: nonceParam,
        timestamp,
        transactions: transaction,
        merkleHash: merkleHash,
        transactionsMined: false,
        transactionHashes: transBHashes
    }
    const newBlock = new Block(nextBlock);
    newBlock.save();


    serverCreatesTheBlock = true


}




setInterval(() => {

    const sendData = async () => {
        // all the transactions in this intervall goes to transB, 
        transB = [...transA];
        transBHashes = [...transAHashes]
        // reset transA 
        transA = [];
        transAHashes = []

        const timestamp = new Date().getTime();
        console.log(timestamp);

        const block = await Block.aggregate([{ $sort: { id: -1 } }, { $limit: 1 }])
        const maxBlockID = await (block[0].id + 1)
        const previousBlockHash = await block[0].hash
        const previousBlockNonce = await block[0].nonce
        console.log(maxBlockID)
        const merkleHash = merkleTreeHash(transBHashes);
        console.log(merkleHash)

        dataToMine = {
            merkleHash,
            blockID: maxBlockID,
            previousBlockHash,
            previousBlockNonce,
            timestamp,
            // get hashnumber 
            difficultyHash: '00005'
        }



        //sends data to the frontend
        io.emit("sendDataForMining", dataToMine);
    }
    sendData()
}, 10000)

const verifiedBlock = async () => {
    const block = await Block.aggregate([{ $sort: { id: -1 } }, { $limit: 1 }]);
    const latestBlock = block[0];
    Block.findById(latestBlock._id)
        .then(
            block => {
                block.id = latestBlock.id,
                    block.hash = latestBlock.hash,
                    block.previousHash = latestBlock.previousHash,
                    block.nonce = latestBlock.nonce,
                    block.timestamp = latestBlock.timestamp,
                    block.transactions = latestBlock.transactions,
                    block.merkleHash = merkleTreeHash(block.transactionHashes),
                    block.transactionsMined = true
                block.transactionHashes = latestBlock.transactionHashes,

                    block.save()

            }

        )

}


const MineRewards = async (userWallet, userHash, userNonce) => {
    const wallet = await DCWallet.find();
    const genesisWallet = wallet[0];
    const users = await User.find();
    const reward = 1;

    let rewardedUser = "";
    for (var i = 0; i < users.length; i++) {
        if (users[i].publicKey === userWallet) {
            rewardedUser = users[i];
        }
    }

    let genesisBalance = genesisWallet.balance;
    let rewardBalance = rewardedUser.balance;

    rewardBalance += reward;
    genesisBalance -= reward;

    User.findById(rewardedUser._id)
        .then(user => {
            user.publicKey = rewardedUser.publicKey;
            user.privateKey = rewardedUser.privateKey;
            user.balance = rewardBalance;

            user.save()
            io.emit('miningSuccess', user);
        })
        .catch(err => res.status(400).json('Error: ' + err));

    DCWallet.findById(genesisWallet._id)
        .then(wallet => {
            wallet.balance = genesisBalance;

            wallet.save()

        })
        .catch(err => res.status(400).json('Error: ' + err));



    const timestampNow = Date.now()
    const tHash = SHA256(rewardedUser.publicKey + 'DCWallet' + reward + timestampNow).toString();

    const miningTrans = {
        toAddress: rewardedUser.publicKey,
        fromAdress: "DCWallet",
        amount: reward,
        hash: tHash,
        timestamp: timestampNow
    }

    const trans = [miningTrans]

    myfunc(userHash, userNonce, trans)

}


io.on("connection", (socket) => {
    console.log('Connection')
    socket.once("sendHash", (testUserFoundHash) => {
        console.log('Hash: ')
        console.log(testUserFoundHash);
        // all the transactions in this intervall goes to transB, 

        const userFoundHash = testUserFoundHash.userPublicKey;

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
        if (redoUserHash == testUserFoundHash.hash) {
            verifiedBlock();

            MineRewards(testUserFoundHash.userPublicKey, redoUserHash, testUserFoundHash.nonce);



            io.emit('hi', userFoundHash);

        }
    });
});

app.get('/', (req, res) => {
    res.send('Hello World')
})

httpServer.listen(port, () => {
    console.log(`Server is running on ${port}`);
})

