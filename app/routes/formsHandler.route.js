const exp = require("express");
router = exp.Router();
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";
const collectionCode = require('../models/formsModel')

const client = new MongoClient(url);


router.get("/", function (req, res) {
    const org = db.get("se_forms").value();
    res.send('dummy');
})

/***
 * Fetch All Routes From DB.
 */

router.get("/getRoutes",function (req,res) {
    MongoClient.connect(url).then((client) => {
  
        const connect = client.db('admin');
      
        // Connect to collection
        const collection = connect
                .collection("se_metadata");
      
        // Fetching the records having 
        // name as saini
        collection.find({})
            .toArray().then((ans) => {
                res.send(ans);
            });
            //res.send()
    }).catch((err) => {
      
        // Printing the error message
       
    })
});


router.post("/savemetadata", function(req,res){
    MongoClient.connect(url).then(async (client) => {
        let collectionName ;
        const connect = client.db('admin');
        let payLoad ;
     
        try{
            let date = getdate();
            payLoad =   req.body.map(data => {
                data.createdat = date;
                data.updatedat = date;  
                collectionName = data.collection;
                data.collection = data.collection;
                data.table = data.table;
                return data;
            })
            let responseData;
            const result = await connect.collection(collectionName).insertMany(payLoad, function(error, inserted) {
                if(error) {
                    console.error(error);
                }
                else {
                    responseData = inserted;
                }
    
            });
               
                res.json(responseData);
                
        }
        catch(err){
            res.send(['error']);
        }
        finally{
            //connect.close();
        }
    })
})

/**
 * Save dynamic component Data,......
 */

router.post("/saveformdata", function(req,res){
    MongoClient.connect(url).then(async (client) => {
        let collectionName ;
        const connect = client.db('admin');
        let payLoad = req.body;
        try{
            let date = getdate();
            collectionName = collectionCode.encodecollections[req.body.coldvalue];
            payLoad.createdat = date;
            payLoad.updatedat = date;  
            delete payLoad.coldvalue;
            let response = {message:'',result:''};
            const result = await connect.collection(collectionName).insertOne(payLoad, function(error, inserted) {
                console.log("error=>",error);
                console.log("result=>",inserted);
                if(error) {
                    console.error(error);
                    res.json(error);
                }
                else {
                    response.message='record inserted successfully';
                    response.result = inserted
                    res.json(response);
                }
    
            });
               
                
                
        }
        catch(err){
            res.send(err);
        }
        finally{
            //connect.close();
        }
    })
});

router.post("/getcollections",async (req,res) => {
    MongoClient.connect(url).then((client) => {
        let tableName = req.body.tablename;
        const connect = client.db('admin');
        let conditionField;
        try{
        if(tableName){
            //collectionCode.decodecollections
            let coll = (!isNaN(Number(req.body.collection)) && typeof Number(req.body.collection) == 'number')? collectionCode.encodecollections[req.body.collection] : req.body.collection;
            const collection = connect
            .collection(coll);
            conditionField = 'table'
            tableName = (!isNaN(Number(tableName)) && typeof Number(tableName) == 'number')? collectionCode.encodecollections[tableName] : tableName;
            if(req.body.formid){
                conditionField = 'formname' 
            }
    // Fetching the records having 
    collection.find({[conditionField]:tableName}).sort({ slno: 1 })
        .toArray().then(async (ans) => {
            let dataValues = [];
            await Promise.all(ans.map(async data => {
                 if(data.controltype == 'dropdown' && data.datasource){
                    let dataProm;
                    dataProm = await getDropdowndataFromSource(data.datasource);
                  data.options = dataProm;
               }
            //      if(data.controltype == 'dropdown' && data.datasource){
            //         let dataProm;
            //         dataProm = await getDropdowndataFromSource(data.datasource);
            //       data.options = dataProm;
            //    }
                 else if(data.controltype == 'picker' && data.datasource){
                    let dataProm;
                    dataProm = await getpickerdataFromSource(data.datasource);
                  data.options = dataProm;
               }
                 else if(data.controltype == 'readonly' && (data.datasource && data.datasource.collection)){
                    let dataProm;
                    dataProm = await generateSequence(data.datasource,data.controlname);
                  data.options = dataProm;
               }
                 data.table = collectionCode.decodecollections[data.table];
                delete data.datasource;
                dataValues.push(data);
                return data;
             })
            );
            res.send(dataValues);
        });
        }
        //this will fetch all collections names...
        else{
            connect.listCollections()
            .toArray().then(data => {
                data.forEach(data=> {
                    data.name = data.name;
                    delete data.type;
                    delete data.info;
                })
             res.send(data);
            });
        }
    }
    catch(err){
            res.status(500).send(err);
    }
    })
}); 

  function getDropdowndataFromSource(data){
    let dataKeys;
    let resp;
    if(data){
   try{
    data = data.split('::');
    dataKeys = data[0].split(':')
    dataKeys[0] = dataKeys[0].replace(/[']/g, '');
    dataKeys[1] = dataKeys[1].replace(/[']/g, '');
     if(dataKeys[1].includes('data')){
       //this.filteredOptions = datakeys2;
       resp = fetchDataSourceData(data);
       return resp;
     }
     else{
       let data2 = data[1].split(':');
       let splitData = data2[1].split('*');
       let collection = splitData[0];
       let condition1 = splitData[1].split(',');
       let condition = {};
       condition1.map(data => {
            if(data.includes('=')){
                data = data.replace(/[=]/g,':');
                condition[data.split(':')[0]] = data.split(':')[1].trim();
               // return {[data.split(':')[0]]:data.split(':')[1]};
            }
            return data;
       });
        resp =  fetchApiData(condition,collection,data[2]);
        return resp;
     }
        
   }
   catch(err){
       return;
   }
   finally{
     
   }
};
 }

 const getpickerdataFromSource = async(data) =>{
    let rawData = data.split('::');
   // let mappedFields = rawData[1].split(';')[1];
    //mappedFields = mappedFields.split(',');
    let mappedCaptions = rawData[1];
    mappedCaptions = mappedCaptions.split(',');
    let querysplit = rawData[0].split('*');
    const collectionName = collectionCode.encodecollections[querysplit[0]];
    let condition = prepareObj(querysplit[1],false);
    let sequenceFields = querysplit[2].split(',') 
    let projectedfields = prepareObj(querysplit[2],true);
    return new Promise((resolve) => {
        MongoClient.connect(url).then(async (client) => {
            try{  
                const connect = client.db('admin');
                const collection = connect.collection(collectionName);
                console.log(collectionName,condition,projectedfields,"dropdown,,,");
                projectedfields._id =0;
                collection.find(condition).project(projectedfields).toArray().then((ans) => {
                    let formattedData = [];
                    ans.forEach(data =>{
                        console.log(ans,"data.......");
                        let obj = {};
                        sequenceFields.map((inner_data,i) => {
                            obj[mappedCaptions[i]] = data[inner_data];
                        });
                    formattedData.push(obj);
                    })
                    resolve(formattedData);
            });
            }
            catch(err){
                resolve(err);
            }
            finally{

            }
        })
    })
 }

 const generateSequence = (datasource,field) => {
        console.log(datasource.collection,datasource.condition,"data valuee....");
        return new Promise((resolve) => {
            MongoClient.connect(url).then(async (client) => {
                try{
                    const connect = client.db('admin');
                   let conditionData = datasource.condition.trim();
                   let projecData = {[field]:1};
                   let formatcondition = {}
                   conditionData = conditionData.split(',').map(i => i.split(':')).forEach(j => formatcondition[j[0].trim()] = j[1]);
                   let getsequencersplit = datasource.fields;
                   let sequenceData = ''
                    const collection = connect
                    .collection(collectionCode.encodecollections[datasource.collection]);
                    collection.find(formatcondition).project({[field]:1,_id:0}).sort(projecData).limit(1)
                    .toArray().then((ans) => {
                        let formattedData = '';
                        if(ans && ans.length>0){
                        let key = Object.keys(ans[0]);
                        formattedData = ans[0][key];
                        formattedData = formattedData.split(getsequencersplit);
                        formattedData = Number(formattedData[1])+1;
                        formattedData = getsequencersplit+formattedData;
                        }
                        else{
                            formattedData =getsequencersplit + 1;
                        }
                        resolve(formattedData);
                    }); 
                }
                catch(err){
                    console.log(err);
                    resolve(err);
                }
                finally{

                }
            })
        })

 }  

 const prepareObj = (obj,projection) => {
    let commaobj = obj.split(',');
    let preparedObj = {};
        commaobj.map(d => {
           preparedObj[d.split(':')[0].toString()] = projection? 1 :d.split(':')[1];
        });
        return preparedObj;
 }

 function fetchDataSourceData(data){
    let datakeys2 = data[1].split(':')[1];
       datakeys2 = datakeys2.replace(/[[']/g, '');
       datakeys2 = datakeys2.replace(/]/g, '');
       datakeys2 = datakeys2.split(',');
       return datakeys2;
 }

function fetchApiData(conditionData,collectionData,projecData){
    return new Promise((resolve) => {
    MongoClient.connect(url).then(async (client) => {
        try{  
            const connect = client.db('admin');
            collectionData = collectionData.trim();
            const collection = connect
            .collection(collectionCode.encodecollections[collectionData]);
            collection.find(conditionData).project({[projecData]:1})
            .toArray().then((ans) => {
                let formattedData = [];
                ans.forEach(data =>{
                    delete data._id;
                    formattedData.push(Object.values(data)[0])
                })
                
                resolve(formattedData);
            });
            
       
       }
        catch(err){
               resolve(err);
        }
         finally{

        }
    })
});
}

router.post('/configfields',(req,res) => {
    MongoClient.connect(url).then(async (client) => {
        try{
            let collection = collectionCode.encodecollections[req.body.collection];
            const connect = client.db('admin');
            const fieldConfigColl = connect.collection(collection);
            let filter;
            if(collection == 'se_formfieldconfig'){
             filter = { formid: req.body.formname,
                controlname: req.body.controlname };
            }
            else{
                 filter = { formid: req.body.formid,
                    table: req.body.table };
                    let fields = req.body.formfields
                    req.body.formfields = fields.toString();
            }
                    req.body.updatedat = getdate(); 
            const updateDoc = {
                $set: req.body,
              };
              const options = { upsert: true };
              delete req.body.collection;
              let result;
               await fieldConfigColl.updateOne(filter, updateDoc, options,function(err,updated){
                result = updated;
                res.send({
                    'message':"Fields Updated",
                    'result':updated
                  })
              });
        }
        catch(err){
            res.send({
                'message':"Error Occured"
              })
        }
        finally{

        }
    })
});


router.post('/fetchfileds',(req,res) => {
    MongoClient.connect(url).then(async (client) => {
        let collectionName ;
        const connect = client.db('admin');
        connect.collection('se_forms').aggregate([
            { $lookup:
              {
                from: 'se_formfieldconfig',
                localField: 'formid',
                foreignField: 'formid',
                as: 'FormDetails'
              }
            },{ $match : { "formid" : 'form_lookups'}}
          ]).toArray(function(err, response) {
            if (err) throw err;
           res.send(response)
          });
    })
})

router.get('/getmenus',async(req,res) => {
    MongoClient.connect(url).then((client) => {
  
        const connect = client.db('admin');
      
        // Connect to collection
        const collection = connect
                .collection("se_metadata");
      
        // Fetching the records having 
        // name as saini
        let data = [];
        collection.find({dataType:'Routes',status:'Active'})
            .toArray().then((ans) => {
                data = ans.map(val =>{
                val.collection = collectionCode.decodecollections[val.collection];
                val.coldname = collectionCode.decodecollections[val.coldname];
                    return val;
                });
                res.send(ans);
            });
            //res.send()
    }).catch((err) => {
      
        // Printing the error message
    })
})

const getdate = () => {
let ts = Date.now();
let date_ob = new Date(ts);
let date = date_ob.getDate();
let month = date_ob.getMonth() + 1;
let year = date_ob.getFullYear();
// prints date & time in YYYY-MM-DD format
return date+"-"+month+"-"+year;
}

module.exports = router;