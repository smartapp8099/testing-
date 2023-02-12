const exp = require("express");
router = exp.Router();

router.post("/organization", function (req, res) {
    const org = db.get("organizations").push(req.body).write();
    res.send(['Organization Inserted Succesfully..'])
})

router.get("/organization", function (req, res) {
    const org = db.get("organizations").value();
    res.send(org);
})

router.get('/', function (req, res) {
    res.send('welcome to organizations..')
})

module.exports = router;