const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();
const jwt = require('jsonwebtoken');

// middleware
app.use(cors());
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vmux1xo.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        console.log('inside err', err)
        return res.status(401).send({ message: 'Unauthorized access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(401).send({ message: 'Unauthorized access' });
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {
        const serviceCollections = client.db('eatWell').collection('services')
        const reviewCollections = client.db('eatWell').collection('reviews')

        app.post('/jwt', async (req, res) => {
            const userEmail = req.body;
            const token = jwt.sign(userEmail, process.env.ACCESS_TOKEN, { expiresIn: '1d' })
            res.send({ token })
        })

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

        // loading review data for each service
        app.get('/reviews', async (req, res) => {
            let query = {};
            if (req.query.service) {
                query = {
                    service: req.query.service
                }
            }
            const cursor = reviewCollections.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })

        // loading review data of each user
        app.get('/myReviews', verifyJWT, async (req, res) => {
            const decoded = req.decoded;
            if (decoded.email !== req.query.email) {
                return res.status(403).send({ message: 'Unauthorized access' });
            }
            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const result = await reviewCollections.find(query).toArray();
            res.send(result)
        })

        // getting all reviews of a single service
        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollections.findOne(query);
            res.send(result)
        })

        // adding a new review
        app.post('/reviews', async (req, res) => {
            const newReview = req.body;
            const result = await reviewCollections.insertOne(newReview)
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