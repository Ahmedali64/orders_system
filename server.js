require("dotenv/config");
const express = require("express")
const helmet = require("helmet");
const authRoutes = require("./src/routes/authRoutes");
const Redis = require("ioredis");
const { RedisStore } = require("connect-redis");
const session = require("express-session");
const { connectToRabbitMQ } = require("./src/config/rabbitmq");


const app = new express();

app.use(express.json());
app.use(helmet());

//test rabbit mq connection
connectToRabbitMQ().then(() => {
  console.log("RabbitMQ is ready");
}).catch((error) => {
  console.error("Failed to initialize RabbitMQ:", error);
  process.exit(1);
});

//sesssion
const redisClient = new Redis( {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
});

const store = new RedisStore({ client: redisClient });
app.use(
    session({
      store: store,
      secret: process.env.SESSION_SECRET,
      resave: false, // Prevents session from being saved back to the store if it wasn't modified
      saveUninitialized: false, // Prevents saving uninitialized sessions
      cookie: {
        sameSite: 'strict',
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
        secure: process.env.NODE_ENV === "production", 
        maxAge: 1000 * 60 * 60 * 24, 
      },
    })
  );


//routes
app.use("/auth", authRoutes);



const port = process.env.PORT;
app.listen(port ,()=>{
    console.log(`Server is running on localhost:${port}`);
});

