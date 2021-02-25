const router = require('express').Router();
let DCWallet = require('../models/DCWallet.model');

router.route('/').get(async (req, res) => {
    try {
        const dcWallet = await DCWallet.find();
        res.json(dcWallet);
    } catch (err) {
        res.json('Error:' + err);
    }
})


router.route('/add').post(async (req, res) => {

    const balance = Number(req.body.balance);


    const newDCWallet = new DCWallet({

        balance

    });

    try {
        const savedDCWallet = await newDCWallet.save();
        res.json(savedDCWallet);
    } catch (err) {
        res.json('Error: ' + err);
    }
})


module.exports = router;