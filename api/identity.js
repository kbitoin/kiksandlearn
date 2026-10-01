import {admin} from 'hatchable';
export const access = 'public';
export default async function(req,res){res.json({isAdmin:await admin.check(req)});}