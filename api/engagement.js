import {db,auth} from 'hatchable';
export const access = 'public';
export const methods = ['GET','POST'];
export default async function(req,res){
const id=req.method==='GET'?req.query.id:req.body?.content_id;
if(typeof id!=='string'||id.length>80)return res.status(400).json({error:'Invalid content'});
if(req.method==='GET'){const {rows}=await db.query("SELECT action,body,created_at FROM engagement WHERE content_id=$1 ORDER BY created_at DESC LIMIT 200",[id]);return res.json(rows);}
const user=req.user||await auth.requireUser(req,res);if(!user)return;const {action,body=''}=req.body;if(!['like','share','comment'].includes(action)||typeof body!=='string'||body.length>2000||(action==='comment'&&!body.trim()))return res.status(400).json({error:'Invalid interaction'});
const {rows}=await db.query('SELECT id FROM content WHERE id=$1 AND published=true',[id]);if(!rows.length)return res.status(404).json({error:'Not found'});
const recent=await db.query("SELECT count(*) AS n FROM engagement WHERE user_id=$1 AND created_at>now()-interval '1 minute'",[user.id]);if(Number(recent.rows[0].n)>10)return res.status(429).json({error:'Please wait before posting again.'});
if(action==='like'){await db.query("INSERT INTO engagement(user_id,content_id,action) SELECT $1,$2,'like' WHERE NOT EXISTS(SELECT 1 FROM engagement WHERE user_id=$1 AND content_id=$2 AND action='like')",[user.id,id]);}else await db.query('INSERT INTO engagement(user_id,content_id,action,body) VALUES($1,$2,$3,$4)',[user.id,id,action,body.trim()]);res.json({ok:true});
}