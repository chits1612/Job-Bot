# Naukri Auto Job Apply Bot

A Node.js automation bot built with **Puppeteer** that automatically searches and applies to jobs on Naukri.com based on configured keywords.

## Features

* Automatic login to Naukri
* Search jobs using multiple keywords
* Filter jobs posted in the **last 7 days**
* Avoid duplicate job applications
* Automatically fill common application questions
* Apply to **Easy Apply** jobs
* Configurable daily limit of applications
* Works with a **cron scheduler (9 AM & 1 PM)**

---

## Tech Stack

* Node.js
* Puppeteer
* node-cron
* fs-extra

---

## Project Structure

```
job-bot/
│
├── bot.js            # Main automation logic
├── scheduler.js      # Cron scheduler
├── config.js         # User configuration
├── appliedJobs.json  # Stores applied job links
├── package.json
└── utils/
    └── delay.js
```

---

## Setup

Install dependencies:

```
npm install
```

Update **config.js** with your Naukri credentials:

```
email: "your_email"
password: "your_password"
```

Add job keywords:

```
keywords: [
 "angular developer",
 "frontend developer",
 "javascript developer"
]
```

---

## Run the Bot

Start the scheduler:

```
npm start
```

The bot will:

* Run immediately
* Run again at **9 AM**
* Run again at **1 PM**

---

## Auto Application Answers

The bot automatically fills common questions:

| Question           | Answer    |
| ------------------ | --------- |
| Expected CTC       | 18 LPA    |
| Current CTC        | 14.5 LPA  |
| Notice Period      | Immediate |
| Location           | Gurgaon   |
| Relocation         | Yes       |
| Angular Experience | 4 years   |
| React Experience   | 4 years   |

---

## Notes

* The bot only applies to **Easy Apply jobs**
* External company application portals are skipped
* Naukri UI changes may require updating selectors

---

## Disclaimer

This project is for **learning and automation experimentation purposes only**.
Use responsibly and follow Naukri's terms of service.
