"""Gamification helpers to reward engagement and progression."""
from datetime import date
from django.db import models
from .models import Badge, UserBadge, XpEvent, Streak
from core.models import User
from users.services import update_engagement


def award_badge(user: User, code: str):
    badge = Badge.objects.filter(code=code).first()
    if not badge:
        return None
    UserBadge.objects.get_or_create(user=user, badge=badge)
    return badge


def ensure_badges():
    badges = [
        ("python-pioneer", "Python Pioneer", "Completed the first lesson in Python Edition."),
        ("quiz-master", "Quiz Master", "Scored 100% on a module diagnostic quiz."),
        ("streak-star", "Streak Star", "Maintained a 7-day learning streak."),
        ("topic-pro", "Topic Pro", "Reached 'Pro' level in any curriculum topic."),
        ("bug-hunter", "Bug Hunter", "Successfully debugged 5 complex Python scripts."),
        ("fast-finger", "Fast Finger", "Completed a coding challenge in under 30 seconds."),
        ("deep-diver", "Deep Diver", "Completed 100% of a module's content and challenges."),
        ("ai-tinkerer", "AI Tinkerer", "Used the AI Tutor to optimize or explain complex logic."),
        ("persistent", "Persistent", "Logged in and learned for 7 consecutive days."),
        ("syntax-sage", "Syntax Sage", "Passed 5 quizzes without a single syntax error."),
        ("algorithm-architect", "Algorithm Architect", "Mastered complex nested data structures and logic."),
        ("logic-legend", "Logic Legend", "Completed Advanced sessions with 100% accuracy."),
        ("loop-master", "Loop Master", "Maintain a 5-day learning streak."),
        ("function-pro", "Function Pro", "Earn 200 XP from practice."),
        ("consistent-learner", "Consistent Learner", "Complete 10 lessons."),
    ]
    for code, title, description in badges:
        Badge.objects.get_or_create(code=code, defaults={"title": title, "description": description})


def add_xp(user: User, points: int, reason: str):
    XpEvent.objects.create(user=user, points=points, reason=reason)
    update_engagement(user, min(0.02, max(0.005, points / 500)))
    ensure_badges()
    xp_total = XpEvent.objects.filter(user=user).aggregate(total_points=models.Sum("points")).get("total_points") or 0
    if xp_total >= 200:
        award_badge(user, "function-pro")


def update_streak(user: User):
    streak, _ = Streak.objects.get_or_create(user=user)
    today = date.today()
    if streak.last_active == today:
        return streak
    if streak.last_active and (today - streak.last_active).days == 1:
        streak.current_streak += 1
    else:
        streak.current_streak = 1
    streak.longest_streak = max(streak.longest_streak, streak.current_streak)
    streak.last_active = today
    streak.save()
    ensure_badges()
    if streak.current_streak >= 5:
        award_badge(user, "loop-master")
    return streak
