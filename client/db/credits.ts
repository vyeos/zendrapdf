import { db } from "./client";
import { user, credit_history } from "./schema";
import { eq, desc, sql } from "drizzle-orm";
import { formatInTimeZone } from "date-fns-tz";
import { v4 as uuidv4 } from "uuid";

const DAILY_ALLOWANCE: Record<string, number> = {
  free: 20,
  creator: 100,
};

const HISTORY_REASONS: Record<string, string> = {
  "4": "AI PDF Generation",
  "1": "AI Edit",
  "-4": "Refund: Generation Failed",
  "-1": "Refund: Edit Failed",
};

/**
 * Safely format creditsResetAt into a standard YYYY-MM-DD UTC string.
 */
function getFormattedResetDate(resetAt: string | Date | null | undefined): string {
  if (!resetAt) return "";
  if (resetAt instanceof Date) {
    return formatInTimeZone(resetAt, "UTC", "yyyy-MM-dd");
  }
  return String(resetAt).slice(0, 10);
}

export const deduceCredits = async (userId: string, cost: number) => {
  try {
    return await db.transaction(async (tx) => {
      // Lock user row FIRST to prevent race conditions
      const [lockedUser] = await tx
        .select({
          id: user.id,
          plan: user.plan,
          creditsLeft: user.creditsLeft,
          creditsResetAt: user.creditsResetAt,
        })
        .from(user)
        .where(eq(user.id, userId))
        .for("update");

      if (!lockedUser) {
        throw new Error(`User not found with id: ${userId}`);
      }

      const todayUTC = formatInTimeZone(new Date(), "UTC", "yyyy-MM-dd");
      const userResetDate = getFormattedResetDate(lockedUser.creditsResetAt);

      let currentCredits = lockedUser.creditsLeft;

      // Only reset daily credits if user's last reset date is strictly in the past
      if (userResetDate !== "" && userResetDate < todayUTC) {
        currentCredits = DAILY_ALLOWANCE[lockedUser.plan] ?? DAILY_ALLOWANCE.free;
        await tx
          .update(user)
          .set({ creditsLeft: currentCredits, creditsResetAt: todayUTC })
          .where(eq(user.id, userId));
      }

      // Check and deduct credits atomically
      const [updatedUser] = await tx
        .update(user)
        .set({
          creditsLeft: sql`${user.creditsLeft} - ${cost}`,
        })
        .where(sql`${user.id} = ${userId} AND ${user.creditsLeft} >= ${cost}`)
        .returning({ creditsLeft: user.creditsLeft });

      if (!updatedUser) {
        throw new Error("Insufficient credits");
      }

      const reasonKey = String(cost);
      const reason =
        HISTORY_REASONS[reasonKey] ?? (cost < 0 ? "Refund" : "Usage");

      await tx.insert(credit_history).values({
        id: uuidv4(),
        userId,
        amount: cost,
        reason: reason,
      });

      return updatedUser.creditsLeft;
    });
  } catch (err) {
    throw new Error(
      err instanceof Error ? err.message : "Credit deduction failed",
    );
  }
};

export const getCreditHistory = async (userId: string) => {
  const history = await db
    .select({
      amount: credit_history.amount,
      reason: credit_history.reason,
      created_at: credit_history.createdAt,
    })
    .from(credit_history)
    .where(eq(credit_history.userId, userId))
    .orderBy(desc(credit_history.createdAt));

  return history;
};

export const ensureDailyAllowance = async (userId: string) => {
  try {
    const [userCheck] = await db
      .select({
        creditsResetAt: user.creditsResetAt,
        plan: user.plan,
        creditsLeft: user.creditsLeft,
      })
      .from(user)
      .where(eq(user.id, userId));

    if (!userCheck) {
      throw new Error(`User not found with id: ${userId}`);
    }

    const todayUTC = formatInTimeZone(new Date(), "UTC", "yyyy-MM-dd");
    const userResetDate = getFormattedResetDate(userCheck.creditsResetAt);

    // If credits were already reset today or resetAt is in the future, return current balance directly
    if (userResetDate !== "" && userResetDate >= todayUTC) {
      return userCheck.creditsLeft;
    }

    const result = await db.transaction(async (tx) => {
      const [currentUser] = await tx
        .select()
        .from(user)
        .where(eq(user.id, userId))
        .for("update");

      if (!currentUser) return 0;

      const currentResetDate = getFormattedResetDate(currentUser.creditsResetAt);

      if (currentResetDate === "" || currentResetDate < todayUTC) {
        const newCredits =
          DAILY_ALLOWANCE[currentUser.plan] ?? DAILY_ALLOWANCE.free;

        const [updatedUser] = await tx
          .update(user)
          .set({ creditsLeft: newCredits, creditsResetAt: todayUTC })
          .where(eq(user.id, userId))
          .returning({ creditsLeft: user.creditsLeft });

        return updatedUser.creditsLeft;
      }

      return currentUser.creditsLeft;
    });

    return result;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(`Failed to ensure daily allowance: ${err.message}`);
    }
    throw new Error("Unknown error checking credits.");
  }
};
