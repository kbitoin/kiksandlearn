import {db} from 'hatchable';
export const access = 'user';
export const methods = ['POST'];
export default async function(req,res){const {type,message}=req.body||{};if(!['Support','Accessibility','Privacy access','Privacy deletion','Privacy correction'].includes(type)||typeof message!=='string'||message.trim().length<5||message.length>4000)return res.status(400).json({error:'Please provide a request type and message.'});await db.query('INSERT INTO support_request(user_id,email,request_type,message) VALUES($1,$2,$3,$4)',[req.user.id,req.user.email,type,message.trim()]);res.json({ok:true});}