const amqplib = require("amqplib");
require("dotenv/config");

let connection;
let channel;


const connectToRabbitMQ = async ()=>{
    try{
        connection = await amqplib.connect(process.env.RABBITMQ_URL);
        console.log("Connected to RabbitMQ");

        channel = await connection.createChannel();
        console.log("Channel created");

       
        await channel.assertQueue("verifyQueue" , {
            durable: true,
            arguments: {
                "x-dead-letter-exchange": "",
                "x-dead-letter-routing-key": "verify_dead_letter_queue"
            }
        });
        console.log("Verify Queue created");

        await channel.assertQueue("resetQueue" , {
            durable: true,
            arguments: {
                "x-dead-letter-exchange": "",
                "x-dead-letter-routing-key": "reset_dead_letter_queue"
            }
        });
        console.log("Reset Queue created");

        await channel.assertQueue("expiryQueue" , {
            durable: true,
            arguments: {
                "x-dead-letter-exchange": "",
                "x-dead-letter-routing-key": "expiry_dead_letter_queue"
            }
        });
        console.log("Expiry Queue created");

    }catch(err){
        console.error(`Failed to connect to RabbitMQ ,Error ${err.message} ,${err.stack}`);
        process.exit(1);
    }
};

// this function made to push email to the queue and  sendToQueue is sync
//data + queue 
function publishToQueue(queue,data) {
    
    if (!channel) throw new Error('Queue not connected');
    //to ensure messages aren’t lost if RabbitMQ restarts:
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)), { persistent: true });
    console.log(`Email published to ${queue} with these data: ${JSON.stringify(data)}`);
}

module.exports = { connectToRabbitMQ , publishToQueue }



