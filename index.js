'use strict'
var express = require('express')
var {getLinkPreview} = require('link-preview-js');
var app = express()
const bodyParser = require('body-parser');
const cors = require('cors')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors({
    origin: '*',
}));

app.post('/link-preview',async (req,res)=>{
    try {
        const resp = await getLinkPreview(req.body.url);
        console.log(resp);
        res.status(200).json({
            metadata : resp,
        });
    } catch (error) {
        console.log(error)
        res.status(400).json({
            error : error
        })
    }
})

app.listen(8001, function () {
  console.log('Example app listening on port 8001!')
})