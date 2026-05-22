from django.core.management import call_command
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = "Run all seeding and hydration commands in the correct sequence"

    def handle(self, *args, **options):
        commands = [
            "seed_curriculum",
            "seed_curriculum_data",
            "hydrate_diagnostic",
            "seed_placement_quiz",
            "hydrate_module1",
            "hydrate_module1_b",
            "hydrate_module1_extra",
            "hydrate_module2",
            "hydrate_module2_b",
            "hydrate_module3",
            "hydrate_module3_b",
            "hydrate_module4",
            "hydrate_module4_b",
            "hydrate_module5",
            "hydrate_module5_b",
            "hydrate_module6",
            "hydrate_module6_b",
            "hydrate_module7",
            "hydrate_module7_b",
            "hydrate_module8",
            "hydrate_module8_b",
            "hydrate_module9",
            "hydrate_module9_b",
            "hydrate_module10",
            "hydrate_module10_b",
            "seed_platform_data",
            "seed_sample_challenges",
            "seed_certificate_templates",
        ]
        
        self.stdout.write(self.style.SUCCESS("Starting all database seeding..."))
        for cmd in commands:
            self.stdout.write(f"Running command: {cmd}...")
            try:
                call_command(cmd, noinput=True)
                self.stdout.write(self.style.SUCCESS(f"Successfully ran {cmd}\n"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error running {cmd}: {str(e)}\n"))
                
        self.stdout.write(self.style.SUCCESS("🎉 All seeding commands completed successfully!"))
