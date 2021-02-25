const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const DCWalletSchema = new Schema({

    balance: { type: Number },

})


const DCWallet = mongoose.model('DCWallet', DCWalletSchema);

module.exports = DCWallet; 