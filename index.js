
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qo68l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // connect to mongodb
    // await client.connect();
    const movieCollection = client.db("moviesDB").collection("movies");
    const favouriteMovieCollection = client.db("moviesDB").collection("favouriteMovie");
    
    // create data
    app.post("/movies", async (req, res) => {
      const movie = req.body;
      const result = await movieCollection.insertOne(movie);
      res.send(result);
    });
    app.post("/favourite_movies", async (req, res) => {
      const favouriteMovie = req.body;
      const result = await favouriteMovieCollection.insertOne(favouriteMovie);
      res.send(result);
    });

    // read data
    app.get("/movies", async (req, res) => {
      const result = await movieCollection.find().toArray()
      res.send(result);
    });
    app.get("/movies-sorted", async (req, res) => {
      const result = await movieCollection.find().sort({ratings : -1}).limit(6).toArray()
      res.send(result);
    });

    app.get("/movies/:id", async(req,res)=>{

      const id = req.params.id;
      const query = { _id: new ObjectId(id)};
      const result = await movieCollection.findOne(query);
      res.send(result)

  })
    app.get("/favourite_movies/:email", async(req,res)=>{

      const email = req.params.email
      const query = { email};
      const result = await favouriteMovieCollection.find(query).toArray();
      res.send(result)

  })
    app.get("/movie", async(req,res)=>{

      const {search} = req.query
      let options ={}
      if (search) {
        options = {
          movieTitle : {$regex : search , $options : "i"}}
      }
      const result = await movieCollection.find(options).toArray();
      res.send(result)

  })

   // update
   app.put("/movie/:id", async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const options = { upsert: true };
    const updateDoc = req.body
    const updatedMovie = {
      $set: {
        movieTitle:updateDoc?.movieTitle,
        poster:updateDoc?.poster,
        genres:updateDoc?.genres,
        duration:updateDoc?.duration,
        releaseYear:updateDoc?.releaseYear,
        summary:updateDoc?.summary,
        ratings:updateDoc?.ratings,
      },
    };
    const result = await movieCollection.updateOne(filter, updatedMovie,options);
    res.send(result)
  });

  // delete
  app.delete("/movies/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await movieCollection.deleteOne(query);
    res.send(result);
  });
  app.delete("/favourite_movies/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await favouriteMovieCollection.deleteOne(query);
    res.send(result);
  });
    

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    
    // await client.close();
  }
}
run().catch(console.log);

app.get("/", (req, res) => {
    res.send("Cineflix server in running");
  });

  

app.listen(port, () => {
  console.log(`Cineflix server is running at port: ${port}`);
});