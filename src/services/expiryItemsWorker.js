const amqp = require('amqplib');
const { sendExpiryNotification } = require("./emailService");
require("dotenv/config")

async function startWorker() {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    channel.prefetch(1);
    // Declare the dead-letter queue
    await channel.assertQueue("expiry_dead_letter_queue");

    // Declare the main queue with DLQ settings
    await channel.assertQueue("expiryQueue", {
        arguments: {
            "x-dead-letter-exchange": "", // default exchange
            "x-dead-letter-routing-key": "expiry_dead_letter_queue"
        }
    });
    console.log("Worker listening on expiryQueue.");



    channel.consume("expiryQueue", async (msg) => {
    if (!msg) return;

    const data = JSON.parse(msg.content.toString());
    if (!data.to) {
      console.error("No recipient defined in email job:", data);
      channel.nack(msg, false, false);
      return;
    }
    
    try {
        if (data.type === "EXPIRY_WARNING" || data.type === "EXPIRY_ALERT") {
            console.log("Sending expiry email to:", data.to );
            await sendExpiryNotification(data.to, data.items, data.type);
        } 
        channel.ack(msg); // mark job as done
    } catch (err) {
        console.error("Error while sending expiry email:", err);
        // Send failed jobs to DLQ
        channel.nack(msg, false, false);
    }
    });
}

startWorker();