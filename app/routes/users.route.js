const exp = require("express");
router = exp.Router();

router.get("/users", function(req,res){
    const user = db.get("users")
    .value();
    res.send(user);
})

router.post("/users", function(req,res) {
    let reqdata = req.body;
    const org = db.get("users").push(reqdata).write();
    res.send(['Data Saved...']);
})

module.exports = router;