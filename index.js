const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

// middleware
app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vmux1xo.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const serviceCollections = client.db('eatWell').collection('services')
        const reviewCollections = client.db('eatWell').collection('reviews')

        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollections.find(query);
            const services = await cursor.toArray();
            res.send(services)
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const serviceDetails = await serviceCollections.findOne(query);
            res.send(serviceDetails)
        })

        app.get('/servicesForHome', async (req, res) => {
            const query = {};
            const cursor = serviceCollections.find(query);
            const services = await cursor.limit(3).toArray();
            res.send(services)
        })

        app.get('/reviews', async (req, res) => {
            let query = {};
            if (req.query.service) {
                query = {
                    service: req.query.service
                }
            }
            const cursor = reviewCollections.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews)
        })

        app.post('/reviews'), async (req, res) => {
            const review = req.body;
            console.log(review)
            const reviews = await reviewCollections.insertOne(review)
            res.send(reviews)
        }
    }
    finally {

    }
}
run().catch(err => console.log(err.name, err.message))

app.get('/', (req, res) => {
    res.send('Eat well server is working!!')
})

app.listen(port, () => {
    console.log('This server is listening on port:', port);
})