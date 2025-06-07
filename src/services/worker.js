const amqp = require('amqplib');
const { sendEmailVerification , sendResetPasswordEmail } = require("../services/emailService");
require("dotenv/config")

async function startWorker() {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    
    // Declare the dead-letter queue
    await channel.assertQueue("email_dead_letter_queue");

    // Declare the main queue with DLQ settings
    await channel.assertQueue("email_queue", {
        arguments: {
            "x-dead-letter-exchange": "", // default exchange
            "x-dead-letter-routing-key": "email_dead_letter_queue"
        }
    });


    
    console.log("Worker listening on email_queue.");
    channel.consume("email_queue", async (msg) => {
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
        } else if (data.type === "RESET_PASSWORD") {
          console.log("Sending reset password email to:", data.to );
          await sendResetPasswordEmail(data.to, data.resetUrl);
        }
        channel.ack(msg); // mark job as done
    } catch (err) {
        console.error("Error processing message:", err);
        // Send failed jobs to DLQ
        channel.nack(msg, false, false);
  }
    });
}

startWorker();