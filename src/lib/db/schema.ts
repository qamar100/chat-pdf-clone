import { integer, pgEnum, pgTable, serial, text, time, timestamp, varchar } from 'drizzle-orm/pg-core';
export const userSystemEnum = pgEnum('user_system_enum', ['system', 'user']);

export const chats = pgTable('chats', {
    id: serial('id').primaryKey(),
    pdfName: text('pdf_name').notNull(),
    pdfUrl: text('pdf_url').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    userId: varchar("user_id", { length: 256 }).notNull(),
    fileKey: text('file_key').notNull(),
});

export type DrizzleChat = typeof chats.$inferSelect;  //to export all the above objects to sidebar

export const messages = pgTable('messages', {
    id: serial('id').primaryKey(),
    chatId: integer('chat_id').references(() => chats.id).notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    role: userSystemEnum('role').notNull(),
    //To see where the message comes from either system or user (enum consists of a set of predefined values) which we have set above.
});


//drizzle-orm interacts with our db
//drizzle-kits provides us with utility functions to create migration(drizzle-kits provides us with utility functions to create migration) make sure all our databse is synced with our schema