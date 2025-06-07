const amqplib = require("amqplib");
require("dotenv/config");

let connection;
let channel;
let email_queue = "email_queue";

const connectToRabbitMQ = async ()=>{
    try{
        connection = await amqplib.connect(process.env.RABBITMQ_URL);
        console.log("Connected to RabbitMQ");

        channel = await connection.createChannel();
        console.log("Channel created");

        await channel.assertQueue(email_queue , {
            durable: true,
            arguments: {
                "x-dead-letter-exchange": "",
                "x-dead-letter-routing-key": "email_dead_letter_queue"
            }
        });
        console.log("Email Queue created");
    }catch(err){
        console.error(`Failed to connect to RabbitMQ ,Error ${err.message} ,${err.stack}`);
        process.exit(1);
    }
};

// this function made to push email to the queue 
function publishToQueue(data) {
    if (!channel) throw new Error('Queue not connected');
    channel.sendToQueue(email_queue, Buffer.from(JSON.stringify(data)));
    console.log(`Email published: ${JSON.stringify(data)}`);
}

module.exports = { connectToRabbitMQ , publishToQueue }



