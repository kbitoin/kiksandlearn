import {db} from 'hatchable';
export const access = 'public';
export const methods = ['GET'];
export default async function(req,res){const {rows}=await db.query("SELECT id,kind,data,created_at FROM content WHERE published=true ORDER BY created_at,id");res.json(rows.map(r=>r.kind==='course'?{...r,data:{...r.data,quiz:r.data.quiz.map(({answer,...q})=>q)}}:r));}