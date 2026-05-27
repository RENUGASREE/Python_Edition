/** XP and level calculations for gamification */

export const QUIZ_PASS_THRESHOLD = 70;

export function xpForLevel(level) {
  return level * 100;
}

export function levelFromXp(xp) {
  let level = 1;
  let needed = 100;
  let remaining = xp;
  while (remaining >= needed) {
    remaining -= needed;
    level += 1;
    needed = level * 100;
  }
  return { level, xpInLevel: remaining, xpToNext: needed - remaining };
}

export function awardXp(user, amount) {
  user.xp = (user.xp || 0) + amount;
  const { level } = levelFromXp(user.xp);
  user.level = level;
  return user;
}
