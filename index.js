const express = require('express');
const cors = require('cors');
const app = express();
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const fileUpload = require('express-fileupload');

app.use(cors());
app.use(express.json());
app.use(fileUpload());

const port = process.env.PORT || 8000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wn1l6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db('Portfolio');
    const projects_collection = database.collection('projects');

    // node mailer
    let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport

    var transporter = nodemailer.createTransport(
      smtpTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
          user: 'rajuportfoliomessage@gmail.com',
          pass: 'raju725800@',
        },
      })
    );

    app.post('/message', async (req, res) => {
      // const data = req.body;
      // const result = await message_collection.insertOne(data);
      console.log('hitting');

      const { name, email, message, subject } = req.body;

      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: 'rajuportfoliomessage@gmail.com', // sender address
        to: 'robeyoulawal@gmail.com', // list of receivers
        subject: subject, // Subject line
        text: message, // plain text body
        html: ` <div>
            <p>from: ${email}</p>
            <p>name: ${name}</p>
            <p>message: ${message}</p>
          </div>`,
      });
      res.send(info);
    });

    app.post('/project', async (req, res) => {
      const { projectName, clientLink, serverLink, technologies, linveLink } =
        req.body;
      // console.log('file', req.files);
      const { img } = req.files;
      const imgData = img.data;
      const encodedImg = imgData.toString('base64');
      const finalImage = Buffer.from(encodedImg, 'base64');
      console.log(img);
      const project = {
        projectName,
        clientLink,
        serverLink,
        technologies,
        linveLink,
        img: finalImage,
      };
      const result = await projects_collection.insertOne(project);
      res.send(result);
    });
  } finally {
    //
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('server is running');
});

app.listen(port, () => {
  console.log('server is running on port', port);
});
