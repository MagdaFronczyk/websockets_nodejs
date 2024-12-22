import express, { Request, Response } from "express";
var router = express.Router()
var path = require('path');

router.use(express.static('public'))

router.get('/', function (req: Request, res: Response) {
    console.log("Req")
    res.sendFile(path.resolve('../public/index.html'));
})

module.exports = router
