import {db} from 'hatchable';
export const access = 'admin';
export const methods = ['GET','POST'];
export default async function(req,res){
if(req.method==='GET'){const {rows}=await db.query('SELECT * FROM content ORDER BY created_at DESC');return res.json(rows);}
const {id,kind,data,published}=req.body||{};
if(!/^[a-z0-9-]{1,80}$/.test(id||'')||!['course','blog'].includes(kind)||!data||typeof data.title!=='string'||data.title.length<3||data.title.length>180)return res.status(400).json({error:'Provide a valid slug, content type and title.'});
if(kind==='course'&&(!Array.isArray(data.lessons)||!data.lessons.length||!Array.isArray(data.quiz)||!data.quiz.length||data.quiz.some(q=>!Array.isArray(q.options)||q.options.length<2||!Number.isInteger(q.answer)||q.answer<0||q.answer>=q.options.length)))return res.status(400).json({error:'Courses need lessons and valid quiz questions.'});
if(kind==='course'&&(data.lessons.some(l=>!l||typeof l.id!=='string'||typeof l.title!=='string'||!l.title.trim()||typeof l.notes!=='string'||!l.notes.trim()||(l.youtube&&!/^[\w-]{11}$/.test(l.youtube)))||new Set(data.lessons.map(l=>l.id)).size!==data.lessons.length))return res.status(400).json({error:'Each lesson needs a unique ID, title and complete notes.'});
if(kind==='blog'&&(typeof data.body!=='string'||data.body.trim().length<100))return res.status(400).json({error:'Add a complete article before saving.'});
if(JSON.stringify(data).length>100000)return res.status(400).json({error:'Content is too large.'});
await db.query('INSERT INTO content(id,kind,data,published) VALUES($1,$2,$3::jsonb,$4) ON CONFLICT(id) DO UPDATE SET data=EXCLUDED.data,published=EXCLUDED.published',[id,kind,JSON.stringify(data),!!published]);res.json({ok:true});
}