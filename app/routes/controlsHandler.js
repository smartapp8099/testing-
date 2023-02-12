const exp = require("express");
router = exp.Router();
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";
const collectionCode = require('../models/formsModel');
const client = new MongoClient(url);

router.post("/getcombodata",(req,res) => {
    MongoClient.connect(url).then((client) => {
        let tableName = req.body.tablename;
        const connect = client.db('admin');
        let conditionField;
        try{
            console.log(req.body.payLoad);
        if(tableName){
    //         const collection = connect
    //         .collection(collectionCode.encodecollections[req.body.collection]);
    // // Fetching the records having 
    // collection.find({[conditionField]:tableName})
    //     .toArray().then((ans) => {
    //         ans.forEach(data=> {
    //             data.table = collectionCode.decodecollections[data.table];
    //         })
    //         res.send(ans);
    //     });
        }
    }
    catch(err){
            res.send('error happend');
    }
    })
})

module.exports = router;