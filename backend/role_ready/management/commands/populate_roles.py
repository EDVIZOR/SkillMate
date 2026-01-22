"""
Management command to populate DevOps and CS roles with skills
Usage: python manage.py populate_roles
"""
from django.core.management.base import BaseCommand
from role_ready.models import Industry, CareerRole, SkillCategory, Skill, RoleSkillMapping


class Command(BaseCommand):
    help = 'Populate database with DevOps and CS roles, skills, and mappings'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting to populate roles and skills...'))

        # Create Industries
        software_industry, _ = Industry.objects.get_or_create(
            name='Software Development',
            defaults={'description': 'Software engineering and development roles'}
        )
        devops_industry, _ = Industry.objects.get_or_create(
            name='DevOps & Infrastructure',
            defaults={'description': 'DevOps, SRE, and infrastructure engineering roles'}
        )
        ai_industry, _ = Industry.objects.get_or_create(
            name='AI & Machine Learning',
            defaults={'description': 'AI, ML, and data science roles'}
        )
        security_industry, _ = Industry.objects.get_or_create(
            name='Cybersecurity',
            defaults={'description': 'Security engineering and cybersecurity roles'}
        )

        # Create Skill Categories
        core_category, _ = SkillCategory.objects.get_or_create(
            name='Core',
            defaults={'description': 'Essential skills required for the role', 'order': 1}
        )
        supporting_category, _ = SkillCategory.objects.get_or_create(
            name='Supporting',
            defaults={'description': 'Important supporting skills', 'order': 2}
        )
        advanced_category, _ = SkillCategory.objects.get_or_create(
            name='Advanced',
            defaults={'description': 'Advanced and specialized skills', 'order': 3}
        )

        # Create Skills
        skills_data = {
            # Programming Languages
            'Python': {'category': core_category, 'description': 'Python programming language'},
            'JavaScript': {'category': core_category, 'description': 'JavaScript programming language'},
            'TypeScript': {'category': core_category, 'description': 'TypeScript programming language'},
            'Java': {'category': core_category, 'description': 'Java programming language'},
            'Go': {'category': core_category, 'description': 'Go programming language'},
            'Rust': {'category': advanced_category, 'description': 'Rust programming language'},
            'C++': {'category': advanced_category, 'description': 'C++ programming language'},
            
            # Backend Frameworks
            'Django': {'category': core_category, 'description': 'Django web framework'},
            'Flask': {'category': supporting_category, 'description': 'Flask web framework'},
            'FastAPI': {'category': supporting_category, 'description': 'FastAPI framework'},
            'Node.js': {'category': core_category, 'description': 'Node.js runtime'},
            'Express.js': {'category': core_category, 'description': 'Express.js framework'},
            'Spring Boot': {'category': core_category, 'description': 'Spring Boot framework'},
            'ASP.NET Core': {'category': supporting_category, 'description': 'ASP.NET Core framework'},
            
            # Frontend
            'React': {'category': core_category, 'description': 'React library'},
            'Vue.js': {'category': supporting_category, 'description': 'Vue.js framework'},
            'Angular': {'category': supporting_category, 'description': 'Angular framework'},
            'HTML/CSS': {'category': core_category, 'description': 'HTML and CSS'},
            
            # Databases
            'PostgreSQL': {'category': core_category, 'description': 'PostgreSQL database'},
            'MySQL': {'category': core_category, 'description': 'MySQL database'},
            'MongoDB': {'category': supporting_category, 'description': 'MongoDB NoSQL database'},
            'Redis': {'category': supporting_category, 'description': 'Redis in-memory database'},
            'SQL': {'category': core_category, 'description': 'SQL query language'},
            
            # DevOps & Infrastructure
            'Docker': {'category': core_category, 'description': 'Docker containerization'},
            'Kubernetes': {'category': core_category, 'description': 'Kubernetes orchestration'},
            'CI/CD': {'category': core_category, 'description': 'Continuous Integration/Deployment'},
            'Jenkins': {'category': supporting_category, 'description': 'Jenkins CI/CD tool'},
            'GitLab CI': {'category': supporting_category, 'description': 'GitLab CI/CD'},
            'GitHub Actions': {'category': supporting_category, 'description': 'GitHub Actions'},
            'Terraform': {'category': core_category, 'description': 'Terraform infrastructure as code'},
            'Ansible': {'category': supporting_category, 'description': 'Ansible automation'},
            'Linux': {'category': core_category, 'description': 'Linux operating system'},
            'Bash/Shell Scripting': {'category': core_category, 'description': 'Bash and shell scripting'},
            
            # Cloud Platforms
            'AWS': {'category': core_category, 'description': 'Amazon Web Services'},
            'Azure': {'category': supporting_category, 'description': 'Microsoft Azure'},
            'GCP': {'category': supporting_category, 'description': 'Google Cloud Platform'},
            'Cloud Architecture': {'category': advanced_category, 'description': 'Cloud architecture design'},
            
            # Monitoring & Observability
            'Prometheus': {'category': supporting_category, 'description': 'Prometheus monitoring'},
            'Grafana': {'category': supporting_category, 'description': 'Grafana visualization'},
            'ELK Stack': {'category': supporting_category, 'description': 'Elasticsearch, Logstash, Kibana'},
            'Datadog': {'category': supporting_category, 'description': 'Datadog monitoring'},
            
            # Networking & Security
            'Networking': {'category': core_category, 'description': 'Network protocols and concepts'},
            'Security Fundamentals': {'category': core_category, 'description': 'Security best practices'},
            'OWASP': {'category': supporting_category, 'description': 'OWASP security standards'},
            'SSL/TLS': {'category': supporting_category, 'description': 'SSL/TLS encryption'},
            
            # Version Control & Collaboration
            'Git': {'category': core_category, 'description': 'Git version control'},
            'GitHub': {'category': core_category, 'description': 'GitHub platform'},
            'GitLab': {'category': supporting_category, 'description': 'GitLab platform'},
            
            # System Design
            'System Design': {'category': advanced_category, 'description': 'System architecture design'},
            'Microservices': {'category': advanced_category, 'description': 'Microservices architecture'},
            'REST APIs': {'category': core_category, 'description': 'RESTful API design'},
            'GraphQL': {'category': supporting_category, 'description': 'GraphQL API'},
            'Message Queues': {'category': advanced_category, 'description': 'RabbitMQ, Kafka, etc.'},
            
            # Testing
            'Unit Testing': {'category': core_category, 'description': 'Unit testing practices'},
            'Integration Testing': {'category': supporting_category, 'description': 'Integration testing'},
            'Test Automation': {'category': supporting_category, 'description': 'Test automation frameworks'},
            
            # AI/ML (for ML roles)
            'Machine Learning': {'category': core_category, 'description': 'Machine learning fundamentals'},
            'Deep Learning': {'category': advanced_category, 'description': 'Deep learning and neural networks'},
            'TensorFlow': {'category': supporting_category, 'description': 'TensorFlow framework'},
            'PyTorch': {'category': supporting_category, 'description': 'PyTorch framework'},
            'Data Science': {'category': core_category, 'description': 'Data science fundamentals'},
            'Pandas': {'category': core_category, 'description': 'Pandas data manipulation'},
            'NumPy': {'category': core_category, 'description': 'NumPy numerical computing'},
            
            # Additional DevOps
            'Helm': {'category': supporting_category, 'description': 'Helm Kubernetes package manager'},
            'Istio': {'category': advanced_category, 'description': 'Istio service mesh'},
            'Vault': {'category': supporting_category, 'description': 'HashiCorp Vault secrets management'},
            'Consul': {'category': supporting_category, 'description': 'HashiCorp Consul service discovery'},
            'Monitoring & Observability': {'category': core_category, 'description': 'Monitoring and observability practices'},
            'Apache Spark': {'category': supporting_category, 'description': 'Apache Spark big data processing'},
            'Airflow': {'category': supporting_category, 'description': 'Apache Airflow workflow orchestration'},
        }

        skills = {}
        for skill_name, skill_info in skills_data.items():
            skill, _ = Skill.objects.get_or_create(
                name=skill_name,
                defaults={
                    'category': skill_info['category'],
                    'description': skill_info['description']
                }
            )
            skills[skill_name] = skill

        # Create Career Roles with their skill mappings
        roles_data = [
            {
                'name': 'DevOps Engineer',
                'industry': devops_industry,
                'description': 'Build and maintain CI/CD pipelines, infrastructure automation, and cloud deployments.',
                'skills': {
                    'Linux': (90, 'critical'),
                    'Docker': (95, 'critical'),
                    'Kubernetes': (90, 'critical'),
                    'CI/CD': (95, 'critical'),
                    'Terraform': (85, 'critical'),
                    'AWS': (90, 'critical'),
                    'Bash/Shell Scripting': (85, 'critical'),
                    'Git': (80, 'high'),
                    'Python': (75, 'high'),
                    'Jenkins': (70, 'high'),
                    'GitLab CI': (70, 'high'),
                    'GitHub Actions': (70, 'high'),
                    'Ansible': (75, 'high'),
                    'Prometheus': (70, 'medium'),
                    'Grafana': (70, 'medium'),
                    'Networking': (75, 'high'),
                    'Security Fundamentals': (70, 'high'),
                    'Helm': (65, 'medium'),
                    'Vault': (60, 'medium'),
                }
            },
            {
                'name': 'Senior DevOps Engineer',
                'industry': devops_industry,
                'description': 'Lead infrastructure initiatives, design scalable systems, and mentor team members.',
                'skills': {
                    'Linux': (95, 'critical'),
                    'Docker': (95, 'critical'),
                    'Kubernetes': (95, 'critical'),
                    'CI/CD': (95, 'critical'),
                    'Terraform': (90, 'critical'),
                    'AWS': (95, 'critical'),
                    'Bash/Shell Scripting': (90, 'critical'),
                    'System Design': (90, 'critical'),
                    'Cloud Architecture': (90, 'critical'),
                    'Python': (80, 'high'),
                    'Go': (75, 'high'),
                    'Ansible': (80, 'high'),
                    'Prometheus': (80, 'high'),
                    'Grafana': (80, 'high'),
                    'Networking': (85, 'high'),
                    'Security Fundamentals': (85, 'high'),
                    'Helm': (75, 'high'),
                    'Istio': (70, 'medium'),
                    'Vault': (75, 'high'),
                    'Consul': (70, 'medium'),
                    'ELK Stack': (75, 'medium'),
                }
            },
            {
                'name': 'Site Reliability Engineer (SRE)',
                'industry': devops_industry,
                'description': 'Ensure system reliability, performance, and availability through automation and monitoring.',
                'skills': {
                    'Linux': (90, 'critical'),
                    'Kubernetes': (90, 'critical'),
                    'Monitoring & Observability': (95, 'critical'),
                    'Prometheus': (90, 'critical'),
                    'Grafana': (90, 'critical'),
                    'Python': (80, 'high'),
                    'Go': (75, 'high'),
                    'System Design': (85, 'critical'),
                    'AWS': (85, 'high'),
                    'Networking': (85, 'high'),
                    'Docker': (85, 'high'),
                    'CI/CD': (80, 'high'),
                    'Terraform': (80, 'high'),
                    'ELK Stack': (80, 'high'),
                    'Datadog': (75, 'medium'),
                    'Bash/Shell Scripting': (85, 'high'),
                }
            },
            {
                'name': 'Backend Developer',
                'industry': software_industry,
                'description': 'Build server-side applications, APIs, and database systems.',
                'skills': {
                    'Python': (90, 'critical'),
                    'Django': (85, 'critical'),
                    'REST APIs': (95, 'critical'),
                    'PostgreSQL': (90, 'critical'),
                    'SQL': (90, 'critical'),
                    'Git': (85, 'high'),
                    'Linux': (75, 'high'),
                    'Docker': (80, 'high'),
                    'Unit Testing': (85, 'high'),
                    'System Design': (75, 'high'),
                    'Redis': (75, 'medium'),
                    'MongoDB': (70, 'medium'),
                    'CI/CD': (70, 'medium'),
                    'AWS': (70, 'medium'),
                    'Message Queues': (65, 'medium'),
                }
            },
            {
                'name': 'Senior Backend Engineer',
                'industry': software_industry,
                'description': 'Design scalable backend systems, lead technical decisions, and mentor developers.',
                'skills': {
                    'Python': (95, 'critical'),
                    'Django': (90, 'critical'),
                    'REST APIs': (95, 'critical'),
                    'PostgreSQL': (95, 'critical'),
                    'SQL': (95, 'critical'),
                    'System Design': (95, 'critical'),
                    'Microservices': (90, 'critical'),
                    'Docker': (85, 'high'),
                    'Kubernetes': (80, 'high'),
                    'AWS': (85, 'high'),
                    'Message Queues': (85, 'high'),
                    'Redis': (85, 'high'),
                    'Git': (90, 'high'),
                    'Unit Testing': (90, 'high'),
                    'Integration Testing': (85, 'high'),
                    'Linux': (85, 'high'),
                    'CI/CD': (85, 'high'),
                    'GraphQL': (75, 'medium'),
                    'Go': (70, 'medium'),
                }
            },
            {
                'name': 'Full Stack Developer',
                'industry': software_industry,
                'description': 'Develop both frontend and backend components of web applications.',
                'skills': {
                    'JavaScript': (90, 'critical'),
                    'React': (85, 'critical'),
                    'Node.js': (85, 'critical'),
                    'Express.js': (80, 'critical'),
                    'HTML/CSS': (90, 'critical'),
                    'PostgreSQL': (80, 'high'),
                    'SQL': (80, 'high'),
                    'REST APIs': (85, 'high'),
                    'Git': (85, 'high'),
                    'Docker': (75, 'medium'),
                    'AWS': (70, 'medium'),
                    'TypeScript': (75, 'high'),
                    'Unit Testing': (80, 'high'),
                }
            },
            {
                'name': 'Frontend Developer',
                'industry': software_industry,
                'description': 'Build user interfaces and client-side applications.',
                'skills': {
                    'JavaScript': (95, 'critical'),
                    'React': (90, 'critical'),
                    'HTML/CSS': (95, 'critical'),
                    'TypeScript': (85, 'high'),
                    'Git': (85, 'high'),
                    'REST APIs': (80, 'high'),
                    'Unit Testing': (80, 'high'),
                    'Vue.js': (70, 'medium'),
                    'Angular': (70, 'medium'),
                    'Node.js': (70, 'medium'),
                }
            },
            {
                'name': 'Cloud Engineer',
                'industry': devops_industry,
                'description': 'Design and manage cloud infrastructure and services.',
                'skills': {
                    'AWS': (95, 'critical'),
                    'Cloud Architecture': (95, 'critical'),
                    'Terraform': (90, 'critical'),
                    'Kubernetes': (85, 'critical'),
                    'Docker': (85, 'critical'),
                    'Linux': (90, 'high'),
                    'Python': (80, 'high'),
                    'Bash/Shell Scripting': (85, 'high'),
                    'CI/CD': (85, 'high'),
                    'Networking': (85, 'high'),
                    'Security Fundamentals': (80, 'high'),
                    'Azure': (70, 'medium'),
                    'GCP': (70, 'medium'),
                    'System Design': (85, 'high'),
                }
            },
            {
                'name': 'Machine Learning Engineer',
                'industry': ai_industry,
                'description': 'Build and deploy machine learning models and AI systems.',
                'skills': {
                    'Python': (95, 'critical'),
                    'Machine Learning': (95, 'critical'),
                    'Deep Learning': (90, 'critical'),
                    'TensorFlow': (85, 'critical'),
                    'PyTorch': (85, 'critical'),
                    'Data Science': (90, 'critical'),
                    'Pandas': (90, 'critical'),
                    'NumPy': (90, 'critical'),
                    'Docker': (80, 'high'),
                    'Kubernetes': (75, 'high'),
                    'AWS': (80, 'high'),
                    'PostgreSQL': (75, 'high'),
                    'Git': (85, 'high'),
                    'System Design': (80, 'high'),
                    'REST APIs': (75, 'medium'),
                }
            },
            {
                'name': 'Data Engineer',
                'industry': ai_industry,
                'description': 'Build data pipelines, ETL processes, and data infrastructure.',
                'skills': {
                    'Python': (90, 'critical'),
                    'SQL': (95, 'critical'),
                    'PostgreSQL': (85, 'critical'),
                    'Data Science': (85, 'critical'),
                    'Pandas': (85, 'critical'),
                    'Docker': (80, 'high'),
                    'Kubernetes': (75, 'high'),
                    'AWS': (85, 'high'),
                    'Apache Spark': (75, 'high'),
                    'Airflow': (75, 'high'),
                    'Git': (85, 'high'),
                    'Linux': (80, 'high'),
                    'Message Queues': (75, 'medium'),
                }
            },
            {
                'name': 'Security Engineer',
                'industry': security_industry,
                'description': 'Protect systems and applications from security threats.',
                'skills': {
                    'Security Fundamentals': (95, 'critical'),
                    'OWASP': (90, 'critical'),
                    'Networking': (90, 'critical'),
                    'Linux': (90, 'critical'),
                    'Python': (80, 'high'),
                    'Docker': (75, 'high'),
                    'Kubernetes': (75, 'high'),
                    'AWS': (80, 'high'),
                    'SSL/TLS': (85, 'high'),
                    'Git': (80, 'high'),
                    'System Design': (75, 'medium'),
                }
            },
            {
                'name': 'Software Engineer',
                'industry': software_industry,
                'description': 'General software engineering role covering full development lifecycle.',
                'skills': {
                    'Python': (85, 'critical'),
                    'JavaScript': (80, 'critical'),
                    'Git': (90, 'critical'),
                    'SQL': (85, 'critical'),
                    'REST APIs': (85, 'critical'),
                    'Unit Testing': (85, 'high'),
                    'Docker': (75, 'high'),
                    'Linux': (80, 'high'),
                    'PostgreSQL': (80, 'high'),
                    'System Design': (75, 'high'),
                    'CI/CD': (70, 'medium'),
                }
            },
            {
                'name': 'Software Architect',
                'industry': software_industry,
                'description': 'Design system architecture and make high-level technical decisions.',
                'skills': {
                    'System Design': (95, 'critical'),
                    'Cloud Architecture': (95, 'critical'),
                    'Microservices': (95, 'critical'),
                    'Python': (85, 'high'),
                    'Java': (80, 'high'),
                    'AWS': (90, 'high'),
                    'Kubernetes': (85, 'high'),
                    'Docker': (85, 'high'),
                    'Message Queues': (90, 'high'),
                    'PostgreSQL': (85, 'high'),
                    'Redis': (80, 'high'),
                    'Networking': (85, 'high'),
                    'Security Fundamentals': (85, 'high'),
                }
            },
            {
                'name': 'Platform Engineer',
                'industry': devops_industry,
                'description': 'Build and maintain internal developer platforms and tooling.',
                'skills': {
                    'Kubernetes': (95, 'critical'),
                    'Docker': (95, 'critical'),
                    'Terraform': (90, 'critical'),
                    'CI/CD': (95, 'critical'),
                    'Python': (85, 'high'),
                    'Go': (80, 'high'),
                    'AWS': (90, 'high'),
                    'System Design': (90, 'high'),
                    'Helm': (85, 'high'),
                    'Prometheus': (80, 'high'),
                    'Grafana': (80, 'high'),
                    'Linux': (90, 'high'),
                    'Bash/Shell Scripting': (85, 'high'),
                }
            },
        ]

        # Create roles and mappings
        for role_data in roles_data:
            role, created = CareerRole.objects.get_or_create(
                name=role_data['name'],
                industry=role_data['industry'],
                defaults={'description': role_data['description']}
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created role: {role.name}'))
            else:
                self.stdout.write(self.style.WARNING(f'Role already exists: {role.name}'))
            
            # Create skill mappings
            for skill_name, (weight, priority) in role_data['skills'].items():
                if skill_name in skills:
                    mapping, _ = RoleSkillMapping.objects.get_or_create(
                        role=role,
                        skill=skills[skill_name],
                        defaults={
                            'weight': weight,
                            'priority_level': priority
                        }
                    )
                    if not _:
                        # Update existing mapping
                        mapping.weight = weight
                        mapping.priority_level = priority
                        mapping.save()

        self.stdout.write(self.style.SUCCESS(f'\nSuccessfully populated {len(roles_data)} roles with skills!'))
        self.stdout.write(self.style.SUCCESS(f'Total skills created: {len(skills)}'))
        self.stdout.write(self.style.SUCCESS('Database population complete!'))
