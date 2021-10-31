const express = require('express');
const cors = require('cors');
const axios = require('axios').default;
const ObjectId = require('mongodb').ObjectId;

const { MongoClient } = require('mongodb');
require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;


//midleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0x1dg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
    try {
        await client.connect();
        const database = client.db("Extour");
        const PlaceCollections = database.collection("places");
        const bookingCollection = database.collection('bookings');

        //GET API
        app.get('/places', async (req, res) => {
            const cursor = PlaceCollections.find({});

            // print a message if no documents were found
            if ((await cursor.count()) === 0) {
                console.log("No documents found!");
            }
            const places = await cursor.toArray();
            res.send(places);
        });
        app.get('/bookings', async (req, res) => {
            const cursor = bookingCollection.find({});

            // print a message if no documents were found
            if ((await cursor.count()) === 0) {
                console.log("No documents found!");
            }
            const bookings = await cursor.toArray();
            res.send(bookings);
        });

        // Get Single place
        app.get('/places/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };

            const place = await PlaceCollections.findOne(query);
            res.send(place)
            console.log(`Got place: ${id} result: ${place}`);
        })
        //POST API
        app.post('/places', async (req, res) => {
            const newplace = req.body;
            const result = await PlaceCollections.insertOne(newplace);
            console.log('got new place', req.body);
            console.log('added place', result);
            res.json(result);
        });
        // Use POST to get data by keys
        app.post('/places/byKeys', async (req, res) => {
            const keys = req.body;
            const query = { key: { $in: keys } }
            const places = await PlaceCollections.find(query).toArray();
            res.send(places);
        });
        // Add Bookings API:
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking);
            console.log(result);
            res.json(result);
        });
        // Use POST to get bookings by id
        app.post('bookings/byKeys', async (req, res) => {
            const keys = req.body;
            console.log('Hitted');
            console.log('body baba: ', keys)
            const query = { email: { $in: keys } }
            const bookings = await bookingCollection.find(query).toArray();
            res.send(bookings);
        });
        // Get Single place
        app.get('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };

            const booking = await PlaceColbookingCollectionlections.findOne(query);
            res.send(booking)
            console.log(`Got place: ${id} result: ${booking}`);
        })
        //DELETE API
        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await bookingCollection.deleteOne(query);
            console.log(`place ${id}  deleted Successfully`, result);
            res.json(result)
        })
        //UPDATE API
        app.put('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const updatedUser = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: `Approved`
                },
            };
            const result = await bookingCollection.updateOne(filter, updateDoc, options)
            console.log('updating', id)
            res.json(result)
        })
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    console.log('hello Extour!');
    res.send("Hello Extour! Lets Explore")
});

app.listen(port, () => {
    console.log('ExTour Listening from port:', port)
})