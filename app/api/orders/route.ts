import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { getDb } from '../../../db';
import { orders } from '../../../db/schema';
import { cartItemSchema, estimate } from '../../../lib/furniture';
const schema=z.object({requestId:z.string().uuid(),name:z.string().trim().min(2).max(100),phone:z.string().trim().max(30).refine(s=>/^\+?[\d\s()\-]+$/.test(s)&&s.replace(/\D/g,'').length>=10&&s.replace(/\D/g,'').length<=15),comment:z.string().max(2000).default(''),items:z.array(cartItemSchema).min(1).max(20)});
export async function POST(request:Request){
 if(request.headers.get('origin')&&request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Недопустимый источник запроса'},{status:403});
 if(Number(request.headers.get('content-length')||0)>50000)return Response.json({error:'Слишком большой запрос'},{status:413});
 try { const raw=await request.text();if(raw.length>50000)return Response.json({error:'Слишком большой запрос'},{status:413});let parsed:unknown;try{parsed=JSON.parse(raw);}catch{return Response.json({error:'Некорректный формат запроса'},{status:400});}const result=schema.safeParse(parsed);if(!result.success)return Response.json({error:'Проверьте имя, телефон и параметры мебели'},{status:400});const b=result.data;const total=b.items.reduce((sum,i)=>sum+estimate(i.config)*i.quantity,0);const db=getDb();
 await db.insert(orders).values({id:b.requestId,name:b.name,phone:b.phone,comment:b.comment,configuration:JSON.stringify(b.items),estimate:total}).onConflictDoNothing();
 const stored=await db.select({id:orders.id,total:orders.estimate}).from(orders).where(eq(orders.id,b.requestId)).get();
 return Response.json(stored,{status:201});
 }catch(error){console.error('Order submission failed',error instanceof Error?error.name:'unknown');return Response.json({error:'Не удалось сохранить заказ. Попробуйте ещё раз — ваша корзина сохранена.'},{status:503});}
}
