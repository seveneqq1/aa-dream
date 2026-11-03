import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const orders=sqliteTable('orders',{id:text('id').primaryKey(),name:text('name').notNull(),phone:text('phone').notNull(),comment:text('comment').notNull().default(''),configuration:text('configuration').notNull(),estimate:integer('estimate').notNull(),createdAt:text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)});
