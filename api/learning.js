import {db,auth} from 'hatchable';
export const access = 'user';
export const methods = ['GET','POST'];
export default async function(req,res){
const user=req.user||await auth.requireUser(req,res);if(!user)return;
if(req.method==='GET'){const {rows}=await db.query('SELECT * FROM learning WHERE user_id=$1 ORDER BY updated_at DESC',[user.id]);return res.json(rows);}
const b=req.body||{};const {rows}=await db.query("SELECT data FROM content WHERE id=$1 AND kind='course' AND published=true",[b.course_id]);if(!rows.length)return res.status(404).json({error:'Course not found'});const course=rows[0].data;
await db.query('INSERT INTO learning(user_id,course_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[user.id,b.course_id]);
if(b.action==='lesson'){if(!course.lessons.some(l=>l.id===b.lesson_id))return res.status(400).json({error:'Invalid lesson'});await db.query("UPDATE learning SET completed=CASE WHEN completed @> $3::jsonb THEN completed ELSE completed || $3::jsonb END,updated_at=now() WHERE user_id=$1 AND course_id=$2",[user.id,b.course_id,JSON.stringify([b.lesson_id])]);}
if(b.action==='time'){const seconds=Number(b.seconds);if(!Number.isInteger(seconds)||seconds<0||seconds>14400)return res.status(400).json({error:'Invalid study duration'});await db.query('UPDATE learning SET seconds=seconds+$3,updated_at=now() WHERE user_id=$1 AND course_id=$2',[user.id,b.course_id,seconds]);}
if(b.action==='quiz'){const a=b.answers;if(!Array.isArray(a)||a.length!==course.quiz.length)return res.status(400).json({error:'Answer every question'});const score=Math.round(100*course.quiz.filter((q,i)=>q.answer===a[i]).length/course.quiz.length);await db.query('UPDATE learning SET score=GREATEST(score,$3),updated_at=now() WHERE user_id=$1 AND course_id=$2',[user.id,b.course_id,score]);return res.json({score,passed:score>=80});}
res.json({ok:true});
}