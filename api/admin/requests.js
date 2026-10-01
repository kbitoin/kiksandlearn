import {db} from 'hatchable';
export const access = 'admin';
export const methods = ['GET'];
export default async function(req,res){const {rows}=await db.query('SELECT * FROM support_request ORDER BY created_at DESC LIMIT 200');res.json(rows);}