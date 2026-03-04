const cron = require("node-cron")
const runBot = require("./bot")

console.log("🚀 Job Bot Scheduler Started")

// RUN IMMEDIATELY WHEN SERVER STARTS
async function startBot(){
 try{
  console.log("Running bot immediately...")
  await runBot()
 }catch(err){
  console.log("Error running bot:", err)
 }
}

startBot()

// RUN DAILY 9 AM
cron.schedule("0 9 * * *", async () => {

 console.log("Running scheduled bot at 9 AM")

 await runBot()

})

// RUN DAILY 1 PM
cron.schedule("0 13 * * *", async () => {

 console.log("Running scheduled bot at 1 PM")

 await runBot()

})

// KEEP PROCESS ALIVE
setInterval(() => {}, 1000)