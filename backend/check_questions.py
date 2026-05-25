import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'python_edition_django.settings')
os.environ['DATABASE_URL'] = 'postgresql://postgres.inkhqgrbjwkwuwetnpjr:Python_Edition28@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres'

django.setup()

from core.models import Question, Quiz

print(f'Total questions: {Question.objects.count()}')
print(f'Quizzes: {Quiz.objects.count()}')

for quiz in Quiz.objects.all():
    print(f'Quiz ID: {quiz.id}, Title: {quiz.title}')
    question_count = Question.objects.filter(quiz_id=quiz.id).count()
    print(f'  Questions: {question_count}')
