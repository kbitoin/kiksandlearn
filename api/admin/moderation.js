import {db} from 'hatchable';
export const access = 'admin';
export const methods = ['GET','DELETE'];
export default async function(req,res){if(req.method==='DELETE'){await db.query('DELETE FROM engagement WHERE id=$1 AND action=$2',[req.body.id,'comment']);return res.json({ok:true});}const {rows}=await db.query("SELECT id,content_id,body,created_at FROM engagement WHERE action='comment' ORDER BY created_at DESC LIMIT 200");res.json(rows);}