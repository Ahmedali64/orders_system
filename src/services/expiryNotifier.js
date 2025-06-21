const cron = require("node-cron");
const db = require("../models/index");
const { Op } = require("sequelize");
const { publishToQueue ,connectToRabbitMQ } = require("../config/rabbitmq");
const { User , Item } = db;
//8AM 0 8 * * *
connectToRabbitMQ().then(() => {
  console.log("RabbitMQ is ready");
}).catch((error) => {
  console.error("Failed to initialize RabbitMQ:", error);
  process.exit(1);
});
cron.schedule("* * * * *", async () => {
  try {
    console.log("📅 Cron scheduler started.");
    const now = new Date();
    const fiveDays = new Date();
    fiveDays.setDate(now.getDate() + 5);

    const fiveDaysStart = new Date(fiveDays);
    fiveDaysStart.setHours(0, 0, 0, 0);

    const fiveDaysEnd = new Date(fiveDays);
    fiveDaysEnd.setHours(23, 59, 59, 999);

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const expiringSoon = await Item.findAll({
      where: {
        expiry_date: {
          [Op.between]: [fiveDaysStart, fiveDaysEnd]
        }
      }
    });

    const expiringToday = await Item.findAll({
      where: {
        expiry_date: {
          [Op.between]: [todayStart, todayEnd]
        }
      }
    });

    const users = await User.findAll({
      where: { role: { [Op.in]: ["admin", "manager"] } }
    });

    for (const user of users) {
      if (expiringSoon.length > 0) {
        publishToQueue("expiryQueue", {
          type: "EXPIRY_WARNING",
          to: user.email,
          items: expiringSoon.map(i => i.toJSON())
        });

      }
      
      if (expiringToday.length > 0) {
        publishToQueue("expiryQueue", {
          type: "EXPIRY_ALERT",
          to: user.email,
          items: expiringToday.map(i => i.toJSON())
        });

      }
    }
  } catch (err) {
    console.error("Cron job failed:", err);
  }
});
