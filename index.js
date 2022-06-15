'use strict'
var express = require('express')
var {getLinkPreview} = require('link-preview-js');
var app = express()
const bodyParser = require('body-parser');
const cors = require('cors')
const fs = require('fs')
const PDFDocument = require('pdfkit');
var qr = require('qr-image');

// var qr_png = qr.image('I love QR!', { type: 'png' });
// qr_png.pipe(require('fs').createWriteStream('qr/test.png'));
app.use('/cert',express.static('pdf'))
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

const generateQR = (data) =>{
   return new Promise((resolve,reject)=>{
       const qr_png = qr.image(`
           ${data.name},
           ${new Date(data.created_at)},
           ${data.npapg},
           ${data.province},
           ${data.district},
           ${data.subdistrict},
           ${data.village}`,
        { type: 'png' });
       qr_png.pipe(require('fs').createWriteStream(`qr/${data.id}.png`));
       resolve(`qr/${data.id}.png`)
    })
} 

app.post('/get-pdf',async (req,res)=>{
    console.log(req.body);
    try {
        generateQR(req.body).then(async (qr_path)=>{
            const doc = new PDFDocument({size:'A4',margin:20,layout:'landscape'});
            setTimeout(()=>{
                doc.pipe(fs.createWriteStream(`pdf/${req.body.id}.pdf`));
                    doc
                    .image('bgSert.png',20,10, {
                        // height:500,
                        width:800,
                    });
                    
                    doc
                    .fontSize(30)
                    .text(req.body.name,20,320,{
                        width:800,
                        align:'center'
                    });
        
                    doc
                    .image(`qr/${req.body.id}.png`,740,500, {
                        width:60,
                        height:60,
                    });
        
                    doc.end();
                res.status(200).json({
                    url : `cert/${req.body.id}.pdf`,
                });
            },1000)
        }).catch(err=>{
            console.log({err})
        })
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