const express = require('Express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 4000;

require('dotenv').config();

app.use(express.json());
app.use(cors());

const blockRouter = require('./routes/block');
const UserRouter = require('./routes/user');

app.use('/blocks', blockRouter);
app.use('/users', UserRouter);

// Test comment

const uri = process.env.ATLAS_URI;
mongoose.connect('mongodb+srv://DC:DC@cluster0.zwe64.mongodb.net/Blockchain?retryWrites=true&w=majority'
    , { useNewUrlParser: true, useCreateIndex: true }
);
const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB database connection established successfully");
})

app.listen(port, () => {
    console.log(`Server is running on ${port}`);
})
