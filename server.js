require("dotenv/config");
const express = require("express")
const helmet = require("helmet");



const app = new express();

app.use(express.json());
app.use(helmet());




const port = process.env.PORT;
app.listen(port ,()=>{
    console.log(`Server is running on localhost:${port}`);
});

