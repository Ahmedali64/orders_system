const amqp = require('amqplib');
const { sendEmailVerification } = require("./emailService");
require("dotenv/config")

async function startWorker() {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    //This ensures each worker only processes one message at a time, preventing overload and improving reliability for all your queues.
    channel.prefetch(1);
    // Declare the dead-letter queue
    await channel.assertQueue("verify_dead_letter_queue");

    // Declare the main queue with DLQ settings
    await channel.assertQueue("verifyQueue", {
        arguments: {
            "x-dead-letter-exchange": "", // default exchange
            "x-dead-letter-routing-key": "verify_dead_letter_queue"
        }
    });
    console.log("Worker listening on verifyQueue.");



    channel.consume("verifyQueue", async (msg) => {
    if (!msg) return;

    const data = JSON.parse(msg.content.toString());
    if (!data.to) {
      console.error("No recipient defined in email job:", data);
      channel.nack(msg, false, false);
      return;
    }
    
    try {
        if (data.type === "VERIFY_EMAIL") {
            console.log("Sending verification email to:", data.to );
            await sendEmailVerification(data.to, data.verifyUrl);
        } 
        channel.ack(msg); // mark job as done
    } catch (err) {
        console.error("Error while sending verification email:", err);
        // Send failed jobs to DLQ
        channel.nack(msg, false, false);
    }
    });
}

startWorker();