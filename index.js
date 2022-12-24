const express = require("express");
const app = express()
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Controller = require("./controller");

const port = 8080;

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const connectDB = async () => {
    try {
      const conn = await mongoose.connect('mongodb://127.0.0.1:27017/PythonGame', {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      });
  
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
};
connectDB()

app.get("/check", Controller.check);
app.post("/update", Controller.update);

app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
});



