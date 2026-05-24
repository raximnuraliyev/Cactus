import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  await pool.query(`
    UPDATE scenario_templates 
    SET briefing_text = 'You are an Undercover Cyber Agent. A suspicious call was flagged originating from Tashkent. The target introduces himself as Alex Morgan, Senior Officer from the Security Division. Interrogate the subject to uncover their true intentions.',
    system_prompt = REPLACE(system_prompt, 'You are playing a FRAUDSTER', 'You are playing a FRAUDSTER communicating with an Undercover Fraud Analyst')
    WHERE category = 'phishing';
    
    UPDATE scenario_templates 
    SET briefing_text = 'You are an Undercover Fraud Analyst. An urgent IT Support call was flagged. The caller claims to be fixing a mandatory endpoint security update. Engage with the caller to determine if they are legitimate IT support.',
    system_prompt = REPLACE(system_prompt, 'You are playing a REAL, LEGITIMATE IT support technician', 'You are playing a REAL, LEGITIMATE IT support technician answering questions from a cautious employee')
    WHERE category = 'phone_call';
    
    UPDATE scenario_templates 
    SET briefing_text = 'You are an Undercover Cyber Agent. A financial advisor contacted a victim about an exclusive cryptocurrency investment opportunity. You have intercepted the chat. Investigate the offer.',
    system_prompt = REPLACE(system_prompt, 'You are playing a FRAUDSTER', 'You are playing a FRAUDSTER communicating with a potential victim (an Undercover Fraud Analyst)')
    WHERE category = 'transaction';

    UPDATE scenario_templates 
    SET briefing_text = 'You are an Undercover Analyst. A letter from the tax authority was reported. Determine if this is a legitimate government communication or a scam by interacting with their online verification portal.',
    system_prompt = REPLACE(system_prompt, 'You are playing a REAL, LEGITIMATE IRS correspondence system', 'You are playing a REAL, LEGITIMATE IRS correspondence system responding to a taxpayer query')
    WHERE category = 'document';
  `);
  console.log("Updated scenarios in DB!");
  process.exit(0);
}
run();
