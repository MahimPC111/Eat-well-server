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
            const result = await cursor.toArray();
            res.send(result)
        })

        // adding a new service 
        app.post('/services', async (req, res) => {
            const newService = req.body;
            const result = await serviceCollections.insertOne(newService);
            res.send(result)
        })

        // loading a single service data
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await serviceCollections.findOne(query);
            res.send(result)
        })

        // loading only 3 service data for home
        app.get('/servicesForHome', async (req, res) => {
            const query = {};
            const cursor = serviceCollections.find(query);
            const result = await cursor.limit(3).toArray();
            res.send(result)
        })

        // loading review data for each service and each user
        app.get('/reviews', async (req, res) => {
            let query = {};
            if (req.query.service) {
                query = {
                    service: req.query.service
                }
            }
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollections.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })

        // getting a single review
        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollections.findOne(query);
            res.send(result)
        })

        // adding a new review
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollections.insertOne(review)
            res.send(result)
        })

        // deleting a review
        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollections.deleteOne(query)
            res.send(result)
        })

        // updating a review
        app.patch('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const review = req.body;
            const query = { _id: ObjectId(id) }
            const updatedReview = {
                $set: {
                    opinion: review.opinion,
                    rating: review.rating
                }
            }
            const result = await reviewCollections.updateOne(query, updatedReview)
            res.send(result)
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