const express = require('express')
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;


const cors = require('cors');
require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yt3ul.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {

    try {

        await client.connect();
        const database = client.db("rongdhonuShop");
        const productsCollection = database.collection("allProducts");
        const reviewsCollection = database.collection("allReviews");
        const ordersCollection = database.collection("allOrders");
        const usersCollection = database.collection("allUsers");
        console.log('Mongodb Connect successfully!');

        // get all products
        app.get('/products', async (req, res) => {

            const cursor = productsCollection.find({})
            const packages = await cursor.toArray();
            res.send(packages);
        })

        // get all orders
        app.get('/allOrders', async (req, res) => {
            const cursor = ordersCollection.find({})
            const orders = await cursor.toArray();
            res.send(orders)
        })

        // add Product
        app.post('/addProduct', async (req, res) => {
            const productDetails = req.body;
            const result = await productsCollection.insertOne(productDetails);
            res.send(result);

        })

        // add Place Order details
        app.post('/addOrder', async (req, res) => {
            const orderDetails = req.body;
            const result = await ordersCollection.insertOne(orderDetails);
            res.send(result);
        })

        // add Review
        app.post('/addReview', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.send(result);
        })

        // get All Review
        app.get('/reviews', async (req, res) => {

            const cursor = reviewsCollection.find({}).sort({ _id: -1 })
            const result = await cursor.toArray();
            res.send(result);
        })

        // find specific order by email
        app.get('/myOrders', (req, res) => {
            ordersCollection.find({ email: req.query.email })
                .toArray((err, documents) => {
                    res.send(documents)
                })
        })

        // delete user order
        app.delete('/allOrders/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await ordersCollection.deleteOne(query);
            res.json(result);

            if (result.deletedCount === 1) {
                console.log("Successfully deleted one document.");
            } else {
                console.log("No documents matched the query. Deleted 0 documents.");
            }
        })

        // delete product from the database
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await productsCollection.deleteOne(query)
            res.json(result);

            if (result.deletedCount === 1) {
                console.log("Successfully deleted one document.");
            } else {
                console.log("No documents matched the query. Deleted 0 documents.");
            }
        })



        // order status update | way 2
        app.put("/statusUpdate/:id", async (req, res) => {
            console.log(req.params.id);
            const filter = { _id: ObjectId(req.params.id) };
            const result = await ordersCollection.updateOne(filter, {
                $set: {
                    status: "Shipped",
                },
            });
            res.send(result);
            console.log(result);
        });



        // add user
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
            console.log(result);
        })

        // update user collection when new user login throw google, and don't store duplicate
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })

        // make admin by updating user role
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log('put', user);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } }
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);

        })

        // finding the user is admin or not by email 
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });

        })
        // echo "# rongdhonu-shop-server" >> README.md
        // git init
        // git add README.md
        // git commit -m "first commit"
        // git branch -M main
        // git remote add origin https://github.com/marjanamahii/rongdhonu-shop-server.git
        // git push -u origin main

    }
    finally {
        // await client.close();
    }

}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('rongdhonu shop server is running!')
})

app.listen(port, () => {
    console.log(`Server is running at ${port}`)
})