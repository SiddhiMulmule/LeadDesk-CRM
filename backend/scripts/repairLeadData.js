require("dotenv").config();
const mongoose = require("mongoose");
const Lead = require("../models/Lead");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/leaddesk";

const records = [
  ["rahul.sharma@gmail.com","Business Website","₹50,000 – ₹1,00,000","Contacted","High","Website","2026-10-10"],
  ["ananya.mehta@gmail.com","E-commerce","₹1,00,000 – ₹2,50,000","Contacted","Medium","Instagram","2026-10-12"],
  ["arjun.patil@gmail.com","Management System","₹2,50,000 – ₹5,00,000","Contacted","High","Referral","2026-10-09"],
  ["neha.kulkarni@gmail.com","Management System","₹50,000 – ₹1,00,000","Closed","High","LinkedIn","2026-10-06"],
  ["rohan.desai@gmail.com","Management System","₹1,00,000 – ₹2,50,000","Contacted","Medium","Website","2026-10-14"],
  ["priya.shah@gmail.com","Management System","₹50,000 – ₹1,00,000","Closed","High","Referral","2026-10-07"]
];

(async()=>{
  try{
    await mongoose.connect(MONGO_URI);
    console.log("LeadDesk CRM V3 • repairing demo lead data...");
    for(const [email,projectType,budget,status,priority,source,followUpDate] of records){
      const result=await Lead.updateOne(
        {email},
        {$set:{projectType,budget,status,priority,source,followUpDate:new Date(followUpDate)}}
      );
      console.log(`${result.matchedCount?"✓":"✗"} ${email}`);
    }
    console.log("Repair complete.");
  }catch(error){
    console.error("Repair failed:",error.message);
    process.exitCode=1;
  }finally{
    await mongoose.disconnect();
  }
})();
