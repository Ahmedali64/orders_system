module.exports = {
  apps: [
    {
      name: "resetWorker",
      script: "src/services/resetPasswordWorker.js"
    },
    {
      name: "verifyWorker",
      script: "src/services/verifyEmailWorker.js"
    },
    {
      name: "expiryWorker",
      script: "src/services/expiryItemsWorker.js"
    },
    {
      name: "cronScheduler",
      script: "src/services/expiryNotifier.js"
    }
  ]
};