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

        // loading all service data
        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollections.find(query);
            const services = await cursor.toArray();
            res.send(services)
        })

        // adding a new service 
        app.post('/services', async (req, res) => {
            const newService = req.body;
            const services = await serviceCollections.insertOne(newService);
            res.send(services)
        })

        // loading a single service data
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const serviceDetails = await serviceCollections.findOne(query);
            res.send(serviceDetails)
        })

        // loading only 3 service data for home
        app.get('/servicesForHome', async (req, res) => {
            const query = {};
            const cursor = serviceCollections.find(query);
            const services = await cursor.limit(3).toArray();
            res.send(services)
        })

        // loading review data for each service
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

        // adding a new review
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const reviews = await reviewCollections.insertOne(review)
            res.send(reviews)
        })

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