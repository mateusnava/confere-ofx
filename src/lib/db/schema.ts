import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const planEnum = pgEnum("plan", ["free", "pro", "escritorio"]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  plan: planEnum("plan").notNull().default("free"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  ipAddress: text("ip_address"),
  statement: jsonb("statement").notNull(),
  balance: jsonb("balance").notNull(),
  kind: text("kind").notNull(),
  bank: text("bank").notNull(),
  pageCount: integer("page_count").notNull().default(1),
  paid: boolean("paid").notNull().default(false),
  paymentRequiredCents: integer("payment_required_cents").notNull().default(0),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const dailyFree = pgTable("daily_free", {
  id: uuid("id").defaultRandom().primaryKey(),
  ipAddress: text("ip_address").notNull(),
  usageDate: text("usage_date").notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }).notNull().defaultNow(),
});

export const monthlyUsage = pgTable("monthly_usage", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  monthKey: text("month_key").notNull(),
  pagesUsed: integer("pages_used").notNull().default(0),
  scansUsed: integer("scans_used").notNull().default(0),
});

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id").references(() => sessions.id),
  userId: uuid("user_id").references(() => users.id),
  mercadoPagoId: text("mercado_pago_id"),
  amountCents: integer("amount_cents").notNull(),
  status: paymentStatusEnum("status").notNull().default("pending"),
  kind: text("kind").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
});
