import { z } from 'zod';
export const products = [
 {id:'sofa',name:'Облачный диван',collection:'Cloud',category:'Диваны',price:485000,dims:[240,82,100],ranges:[[160,360],[65,110],[75,140]],color:2,material:1},
 {id:'bed',name:'Кровать с мягким изголовьем',collection:'Luna',category:'Кровати',price:395000,dims:[180,110,220],ranges:[[120,240],[80,160],[190,250]],color:3,material:2},
 {id:'chair',name:'Обволакивающее кресло',collection:'Haven',category:'Кресла',price:225000,dims:[90,85,88],ranges:[[65,130],[65,120],[65,120]],color:5,material:1},
 {id:'table',name:'Обеденный стол',collection:'Forma',category:'Столы',price:285000,dims:[180,76,90],ranges:[[100,280],[65,100],[60,130]],color:8,material:0},
 {id:'wardrobe',name:'Шкаф с чистыми линиями',collection:'Linea',category:'Шкафы',price:595000,dims:[200,220,60],ranges:[[120,300],[160,280],[40,80]],color:2,material:5},
 {id:'dresser',name:'Лаконичный комод',collection:'Still',category:'Комоды',price:245000,dims:[140,80,45],ranges:[[80,220],[60,130],[35,65]],color:7,material:0},
 {id:'kitchen',name:'Модульная кухня',collection:'Atelier',category:'Кухонная мебель',price:895000,dims:[280,220,60],ranges:[[180,420],[190,280],[50,80]],color:4,material:5},
];
export const colors = [
 ['Белый','#f0efea'],['Чёрный','#282827'],['Бежевый','#c5b59d'],['Кремовый','#e2d6bf'],['Серый','#a4a5a2'],['Графитовый','#555655'],['Коричневый','#72513f'],['Ореховый','#755b46'],['Дубовый','#b4946d'],['Красный','#9b3e36'],['Синий','#35546a'],['Зелёный','#65745a'],['Розовый','#c99b9a'],['Золотистый','#b99b58'],['Молочный','#ede7db'],['Песочный','#d1bd9c'],['Тауп','#9a8c7d'],['Карамель','#ae7d52'],['Шоколад','#4b3831'],['Кофейный','#8c7162'],['Терракотовый','#bc7860'],['Бордовый','#663c45'],['Пудровый','#d9bbb0'],['Персиковый','#dab393'],['Охра','#bc934b'],['Оливковый','#7f8262'],['Шалфей','#a4b09b'],['Изумрудный','#285d50'],['Мятный','#aec8bd'],['Небесный','#a7becb'],['Индиго','#3d4661'],['Лавандовый','#b4a6c3'],['Сливовый','#79596f'],['Жемчужный','#d6d4ce'],['Серебристый','#b8bcc0'],['Тёмный дуб','#635342'],
];
export const materials = [
 {name:'Натуральное дерево',note:'Живая фактура',factor:1.2,roughness:.58},
 {name:'Мягкий велюр',note:'Мягкость в каждом касании',factor:1,roughness:.94},
 {name:'Бархат',note:'Глубокий цвет и нежный ворс',factor:1.15,roughness:.8},
 {name:'Кожа',note:'Выразительная натуральность',factor:1.55,roughness:.38},
 {name:'Экокожа',note:'Практичная элегантность',factor:1.08,roughness:.45},
 {name:'Матовая поверхность',note:'Сдержанная и тактильная',factor:.92,roughness:.83},
 {name:'Глянцевая поверхность',note:'Свет в каждой детали',factor:1.12,roughness:.13},
];
export const configSchema = z.object({product:z.enum(['sofa','bed','chair','table','wardrobe','dresser','kitchen']),width:z.number().finite(),height:z.number().finite(),depth:z.number().finite(),color:z.number().int().min(0).max(35),material:z.number().int().min(0).max(6)}).superRefine((c,ctx)=>{ const p=products.find(p=>p.id===c.product)!; [c.width,c.height,c.depth].forEach((v,i)=>{if(v<p.ranges[i][0]||v>p.ranges[i][1])ctx.addIssue({code:'custom',message:'Размер за пределами допустимого диапазона'});}); });
export type Config = z.infer<typeof configSchema>;
export const cartItemSchema=z.object({id:z.string().max(80),config:configSchema,quantity:z.number().int().min(1).max(20)});
export type CartItem=z.infer<typeof cartItemSchema>;
export function defaults(id='sofa'):Config {const p=products.find(p=>p.id===id)||products[0];return {product:p.id as Config['product'],width:p.dims[0],height:p.dims[1],depth:p.dims[2],color:p.color,material:p.material};}
export function estimate(c:Config){const p=products.find(p=>p.id===c.product)!;const ratio=(c.width*c.height*c.depth)/(p.dims[0]*p.dims[1]*p.dims[2]);return Math.round(p.price*Math.pow(ratio,.65)*materials[c.material].factor/materials[p.material].factor/1000)*1000;}
export const money=(n:number)=>new Intl.NumberFormat('ru-RU').format(n)+' ₸';
