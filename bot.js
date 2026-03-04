const puppeteer = require("puppeteer")
const fs = require("fs-extra")
const config = require("./config")
const delay = require("./utils/delay")

function buildSearchUrl(keyword){
 const encodedKeyword = encodeURIComponent(keyword)
 return `https://www.naukri.com/${encodedKeyword}-jobs?k=${encodedKeyword}&jobAge=7`
}

// CHECK JOB AGE
function isJobRecent(postedText, maxDays){

 if(!postedText) return false

 const text = postedText.toLowerCase()

 if(text.includes("today") || text.includes("just now"))
  return true

 if(text.includes("hour"))
  return true

 const match = text.match(/(\d+)/)

 if(match){
  const days = parseInt(match[1])
  return days <= maxDays
 }

 return false
}


// ==============================
// AUTO ANSWER APPLICATION QUESTIONS
// ==============================

async function handleApplicationQuestions(page){

 try{

  const labels = await page.$$("label")

  for(const label of labels){

   const text = await page.evaluate(el => el.innerText.toLowerCase(), label)

   const forAttr = await page.evaluate(el => el.getAttribute("for"), label)

   if(!forAttr) continue

   const input = await page.$(`#${forAttr}`)

   if(!input) continue

   if(text.includes("expected ctc")){
    await input.click({clickCount:3})
    await input.type("18")
   }

   else if(text.includes("current ctc")){
    await input.click({clickCount:3})
    await input.type("14.5")
   }

   else if(text.includes("notice period")){
    await input.click({clickCount:3})
    await input.type("0")
   }

   else if(text.includes("current location")){
    await input.click({clickCount:3})
    await input.type("Gurgaon")
   }

   else if(text.includes("angular")){
    await input.click({clickCount:3})
    await input.type("4")
   }

   else if(text.includes("react")){
    await input.click({clickCount:3})
    await input.type("4")
   }

  }

  // HANDLE RELOCATION RADIO BUTTON
  const relocateYes = await page.$('input[value="Yes"]')

  if(relocateYes){
   await relocateYes.click()
  }

 }catch(err){
  console.log("Question handling error:", err)
 }

}



// ==============================
// MAIN BOT
// ==============================

async function runBot(){

 console.log("🚀 Starting Job Bot...")

 const browser = await puppeteer.launch({
  headless:false,
  defaultViewport:null
 })

 const page = await browser.newPage()

 const appliedData = await fs.readJson("./appliedJobs.json")

 let appliedCount = 0

 try{

  // LOGIN
  console.log("Opening login page")

  await page.goto("https://www.naukri.com/nlogin/login",{waitUntil:"networkidle2"})

  await delay(4000)

  await page.type("#usernameField", config.email)

  await page.type("#passwordField", config.password)

  await page.click("button[type=submit]")

  await delay(6000)

  console.log("✅ Login successful")



  // SEARCH JOBS
  for(const keyword of config.keywords){

   console.log("🔍 Searching jobs for:", keyword)

   const searchUrl = buildSearchUrl(keyword)

   await page.goto(searchUrl,{waitUntil:"networkidle2"})

   await delay(5000)

   await page.waitForSelector(".srp-jobtuple-wrapper",{timeout:10000})

   await page.evaluate(()=>{
    window.scrollBy(0,window.innerHeight)
   })

   await delay(3000)



   // SCRAPE JOBS
   const jobs = await page.$$eval(".srp-jobtuple-wrapper", jobCards => {

    return jobCards.map(job => {

     const link = job.querySelector("a.title")?.href

     const posted = job.querySelector(".job-post-day")?.innerText

     return {
      link,
      posted
     }

    })

   })

   console.log("📊 Jobs found:", jobs.length)



   for(const job of jobs){

    if(appliedCount >= config.maxApplyPerRun) break

    if(!job.link) continue

    if(!isJobRecent(job.posted, config.maxJobAgeDays)){
     console.log("⏩ Old job skipped:", job.posted)
     continue
    }

    if(appliedData.jobs.includes(job.link)){
     console.log("⚠ Already applied:", job.link)
     continue
    }



    try{

     await page.goto(job.link,{waitUntil:"networkidle2"})

     await delay(4000)

     const applyBtn = await page.$("button.apply-button")

     if(!applyBtn){
      console.log("❌ No Easy Apply:", job.link)
      continue
     }

     await applyBtn.click()

     await delay(3000)



     // HANDLE QUESTIONS
     await handleApplicationQuestions(page)



     // SUBMIT APPLICATION
     const submitBtn = await page.$("button[type='submit']")

     if(submitBtn){
      await submitBtn.click()
      console.log("✅ Applied:", job.link)
     }

     appliedData.jobs.push(job.link)

     appliedCount++

     await delay(Math.random()*3000 + 2000)

    }catch(err){

     console.log("❌ Error applying:", err)

    }

   }

  }



  await fs.writeJson("./appliedJobs.json", appliedData)

  console.log("🎯 Total applied:", appliedCount)

 }catch(err){

  console.log("Bot error:", err)

 }

 await browser.close()

}

module.exports = runBot