import { z } from "zod";

// Reject impossible dates like 2026-02-30, not just the wrong format
function isRealDate(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}

export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
  .refine(isRealDate, "Date is not a real calendar date");

export const monthSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Month must be in YYYY-MM format");

export const categorySchema = z
  .string()
  .trim()
  .min(1, "Category is required")
  .max(50);

export const amountSchema = z
  .number()
  .positive("Amount must be greater than 0")
  .max(1_000_000_000);
