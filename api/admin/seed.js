import {db} from 'hatchable';
import {initial} from 'lib/catalog.js';
export const access = 'admin';
export const methods = ['POST'];
export default async function(req,res){for(const r of initial)await db.query('INSERT INTO content(id,kind,data,published) VALUES($1,$2,$3::jsonb,true) ON CONFLICT(id) DO NOTHING',[r.id,r.kind,JSON.stringify(r.data)]);res.json({ok:true,count:initial.length});}