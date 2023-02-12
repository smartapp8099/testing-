const exp = require("express");
router = exp.Router();

router.post("/programs", function (req, res) {
  reqbody = req.body;
  const data = db.get("programs").push(reqbody).write();
  res.send(["Inserted successfully..."]);
});

router.get("/programs", function (req, res) {
  const programs = db.get("programs").value();
  res.send(programs);
})

router.get("/", function (req, res) {
  res.send(JSON.stringify('Program endpoint is working'));
});

router.get("/clients",function(req,res) {
 let searchkey = req.params.id;
   const data = db.get("clients")
  //  .filter(function(o) {
  //     return o['client'].match((searchkey.toUpperCase() || searchkey.toLowerCase()));
  //  })
   .value()
  res.send((data));
})

router.get("/searchclients/:id",function(req,res) {
 let searchkey = req.params.id;
  let found;
  let reqexp = /[A-Z]/gi;
  //console.log(searchkey,"****")  
   const data = db.get("clients")
    .filter(function(o) {
       if(searchkey == '***') {
        console.log("&&&&&&&",searchkey)
         found = o['name'].match(reqexp);
        console.log(found)
    }
       else found = o['name'].toLowerCase().match(searchkey.toLowerCase());
       return found;
    })
  res.send(data);
})

router.get('/programid',function(req,res){
  var alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let rtn;
  for (var i = 0; i < 15; i++) {
    rtn += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
 res.send([rtn.split()]); 
});

module.exports = router;