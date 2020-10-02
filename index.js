
const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser')
const cors = require('cors')
const ObjectId = require('mongodb').ObjectId;
const admin = require('firebase-admin');


app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
require('dotenv').config()

const serviceAccount = require("./burj-al-arab-07-firebase-adminsdk-d0oq6-b519d918ae.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://burj-al-arab-07.firebaseio.com"
});



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bdq7m.mongodb.net/<dbname>?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const bookings = client.db(`${process.env.DB_DATA}`).collection(`${process.env.DB_COLLECTION}`);
  // perform actions on the collection object
  app.post('/addBooking', (req, res) => {
      const info = req.body;
      bookings.insertOne(info)
    .then( ( documents) => res.send(documents.ops[0]))
}) 
   app.get('/Booking', (req, res) => {
      const bearer = req.headers.auth;
      if(bearer && bearer.startsWith("Bearer")){
        const idToken = bearer.split(" ")[1];
        // idToken comes from the client app
        admin.auth().verifyIdToken(idToken)
        .then(function(decodedToken) {
          let uid = decodedToken.email;
          // ...
          const userEmail = req.query.email;
          if( uid == userEmail){
            bookings.find({email: userEmail})
            .toArray((err, documents) => {
                res.send(documents);
            })
          }
          else{
            res.status('401').send("Unathorized")
          }
        }).catch(function(error) {
          // Handle error
        });

      }
      else{
        res.status('401').send("Unathorized")
      }
   })
   app.delete('/cancel/:id', (req, res) => {
     bookings.deleteOne({_id: ObjectId(req.params.id)})
   }) 
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(process.env.PORT)
