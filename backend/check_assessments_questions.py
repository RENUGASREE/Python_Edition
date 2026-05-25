import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'python_edition_django.settings')
os.environ['DATABASE_URL'] = 'postgresql://postgres.inkhqgrbjwkwuwetnpjr:Python_Edition28@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres'

django.setup()

from assessments.models import DiagnosticQuiz, DiagnosticQuestion

print(f'Diagnostic Quizzes: {DiagnosticQuiz.objects.count()}')
for quiz in DiagnosticQuiz.objects.all():
    print(f'Quiz ID: {quiz.id}, Title: {quiz.title}')
    question_count = DiagnosticQuestion.objects.filter(quiz=quiz).count()
    print(f'  Questions: {question_count}')
