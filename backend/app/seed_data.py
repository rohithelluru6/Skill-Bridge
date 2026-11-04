import json
import logging
from app.database import db
from app.auth.security import get_password_hash

logger = logging.getLogger("skillbridge.seed")

def seed_database():
    """Seeds default skills, careers, learning resources, projects, assessments, and sample accounts."""
    # Check if already seeded
    existing_skills = db.query_one("SELECT COUNT(*) as count FROM skills")
    if existing_skills and existing_skills["count"] > 10:
        logger.info("Database already seeded with core catalog.")
        return

    logger.info("Starting database seeding...")

    # 1. Master Skills
    skills_data = [
        # Technical Skills
        ("Python", "Technical", "High-level, interpreted programming language widely used in AI, data science, and web development."),
        ("Java", "Technical", "Object-oriented, class-based programming language used extensively in enterprise backends and Android."),
        ("C", "Technical", "Low-level procedural language foundational for systems programming and embedded engineering."),
        ("C++", "Technical", "High-performance object-oriented language used in game development, systems, and algorithmic trading."),
        ("SQL", "Technical", "Standard relational database query language for data manipulation, joins, and reporting."),
        ("HTML", "Technical", "Standard markup language for documents designed to be displayed in a web browser."),
        ("CSS", "Technical", "Style sheet language used for describing the presentation of a document written in HTML."),
        ("JavaScript", "Technical", "Core scripting language of the web enabling interactive web pages and backend runtimes."),
        ("React", "Technical", "Declarative, component-based front-end JavaScript library maintained by Meta."),
        ("Machine Learning", "Technical", "Field of study giving computers the ability to learn without being explicitly programmed."),
        ("Data Structures", "Technical", "Fundamental specialized format for organizing, processing, retrieving and storing data efficiently."),
        ("Cloud Computing", "Technical", "On-demand availability of computer system resources like AWS, Azure, and GCP."),
        ("Docker", "Technical", "Platform for building, shipping, and running applications in lightweight containers."),
        ("Node.js", "Technical", "JavaScript runtime built on Chrome's V8 engine for scalable backend network applications."),
        ("Deep Learning", "Technical", "Subset of machine learning based on artificial neural networks with representation learning."),
        ("Git", "Technical", "Distributed version control system tracking changes in source code during software development."),
        ("Cybersecurity Fundamentals", "Technical", "Protection of computer systems and networks from attack, damage, or unauthorized access."),
        ("Linux", "Technical", "Open-source Unix-like operating system kernel powering servers, supercomputers, and cloud systems."),
        ("REST APIs", "Technical", "Architectural style for network applications using standard HTTP methods and JSON formatting."),
        ("TypeScript", "Technical", "Strict syntactical superset of JavaScript adding optional static type definitions."),
        
        # Professional Skills
        ("Communication", "Professional", "Ability to convey technical ideas clearly in speech, documentation, and code reviews."),
        ("Problem Solving", "Professional", "Analytical capability to break down complex issues into manageable, systematic solutions."),
        ("Teamwork", "Professional", "Collaborating effectively within cross-functional engineering teams."),
        ("Leadership", "Professional", "Guiding projects, mentoring peers, and taking ownership of technical initiatives."),
        ("Critical Thinking", "Professional", "Objective analysis and evaluation of architectural trade-offs and decisions."),
        ("Time Management", "Professional", "Prioritizing engineering tasks, managing technical debt, and meeting sprint deadlines."),
        ("Agile & Scrum", "Professional", "Iterative project management methodology used in commercial software engineering sprints."),
        ("Design Systems & UI", "Professional", "User-centered design thinking, accessibility (WCAG), and responsive interface structuring.")
    ]

    for name, cat, desc in skills_data:
        db.execute(
            "INSERT INTO skills (name, category, description) VALUES (?, ?, ?)",
            (name, cat, desc)
        )

    # Cache skill id map
    all_skills = db.query("SELECT id, name FROM skills")
    skill_map = {s["name"]: s["id"] for s in all_skills}

    # 2. Career Paths
    careers_data = [
        {
            "title": "Software Developer",
            "slug": "software-developer",
            "category": "Software Engineering",
            "description": "Designs, writes, tests, and maintains scalable software applications, core libraries, and systems.",
            "industry_expectations": "Strong mastery of data structures and algorithms, clean object-oriented architecture, version control, automated testing, and collaborative git workflows.",
            "average_salary_range": "$75,000 - $140,000 / ₹8 - 24 LPA",
            "demand_level": "Very High",
            "icon_name": "Code2",
            "required_skills": [
                ("Data Structures", 4.5, "Required"),
                ("Python", 4.0, "Required"),
                ("Java", 3.5, "Preferred"),
                ("Git", 4.0, "Required"),
                ("SQL", 3.5, "Required"),
                ("Problem Solving", 4.5, "Required"),
                ("Teamwork", 4.0, "Required"),
                ("REST APIs", 4.0, "Required")
            ]
        },
        {
            "title": "AI/ML Engineer",
            "slug": "aiml-engineer",
            "category": "Artificial Intelligence",
            "description": "Researches, builds, and deploys predictive machine learning models and deep neural networks to production.",
            "industry_expectations": "Strong mathematical grounding in linear algebra and statistics, Python proficiency, PyTorch/TensorFlow, model evaluation, and MLOps deployment pipelines.",
            "average_salary_range": "$95,000 - $175,000 / ₹12 - 35 LPA",
            "demand_level": "Extremely High",
            "icon_name": "Brain",
            "required_skills": [
                ("Python", 5.0, "Required"),
                ("Machine Learning", 4.5, "Required"),
                ("Deep Learning", 4.0, "Required"),
                ("SQL", 3.5, "Required"),
                ("Data Structures", 4.0, "Required"),
                ("Cloud Computing", 3.5, "Preferred"),
                ("Critical Thinking", 4.5, "Required"),
                ("Docker", 3.5, "Preferred")
            ]
        },
        {
            "title": "Data Scientist",
            "slug": "data-scientist",
            "category": "Data Science",
            "description": "Extracts actionable strategic insights and patterns from massive structured and unstructured datasets.",
            "industry_expectations": "Expertise in exploratory data analysis (EDA), hypothesis testing, SQL joins and aggregations, feature engineering, and executive data storytelling.",
            "average_salary_range": "$85,000 - $155,000 / ₹10 - 28 LPA",
            "demand_level": "High",
            "icon_name": "LineChart",
            "required_skills": [
                ("Python", 4.5, "Required"),
                ("SQL", 4.5, "Required"),
                ("Machine Learning", 4.0, "Required"),
                ("Critical Thinking", 4.5, "Required"),
                ("Communication", 4.5, "Required"),
                ("Problem Solving", 4.0, "Required")
            ]
        },
        {
            "title": "Full Stack Developer",
            "slug": "full-stack-developer",
            "category": "Web Engineering",
            "description": "Constructs end-to-end web applications bridging intuitive responsive frontends with robust backend microservices.",
            "industry_expectations": "Proficiency across modern frontend UI libraries (React/Vue), server-side runtimes (Node/FastAPI), SQL/NoSQL databases, state management, and cloud deployment.",
            "average_salary_range": "$80,000 - $145,000 / ₹9 - 26 LPA",
            "demand_level": "Very High",
            "icon_name": "Layers",
            "required_skills": [
                ("JavaScript", 4.5, "Required"),
                ("React", 4.5, "Required"),
                ("HTML", 4.5, "Required"),
                ("CSS", 4.0, "Required"),
                ("Node.js", 4.0, "Required"),
                ("SQL", 4.0, "Required"),
                ("REST APIs", 4.5, "Required"),
                ("Git", 4.0, "Required")
            ]
        },
        {
            "title": "Cloud Engineer",
            "slug": "cloud-engineer",
            "category": "Cloud & Infrastructure",
            "description": "Architects, provisions, and automates high-availability cloud infrastructure and serverless workloads.",
            "industry_expectations": "Deep knowledge of AWS/Azure/GCP architectures, Infrastructure-as-Code (Terraform), VPC networking, security groups, and cost optimization.",
            "average_salary_range": "$85,000 - $150,000 / ₹10 - 28 LPA",
            "demand_level": "High",
            "icon_name": "Cloud",
            "required_skills": [
                ("Cloud Computing", 5.0, "Required"),
                ("Linux", 4.5, "Required"),
                ("Docker", 4.0, "Required"),
                ("Python", 3.5, "Preferred"),
                ("Cybersecurity Fundamentals", 4.0, "Required"),
                ("Problem Solving", 4.0, "Required")
            ]
        },
        {
            "title": "DevOps Engineer",
            "slug": "devops-engineer",
            "category": "DevOps & SRE",
            "description": "Bridges software development and IT operations through continuous integration, automation, and site reliability.",
            "industry_expectations": "Proficiency in containerization (Docker, Kubernetes), CI/CD pipelines (GitHub Actions), monitoring/observability (Prometheus/Grafana), and Linux internals.",
            "average_salary_range": "$90,000 - $160,000 / ₹11 - 30 LPA",
            "demand_level": "High",
            "icon_name": "Terminal",
            "required_skills": [
                ("Docker", 4.5, "Required"),
                ("Linux", 4.5, "Required"),
                ("Cloud Computing", 4.0, "Required"),
                ("Git", 4.5, "Required"),
                ("Python", 3.5, "Preferred"),
                ("Time Management", 4.0, "Required")
            ]
        },
        {
            "title": "Cybersecurity Analyst",
            "slug": "cybersecurity-analyst",
            "category": "Information Security",
            "description": "Safeguards organizational networks, detects intrusion threats, performs vulnerability assessments, and enforces compliance.",
            "industry_expectations": "Understanding of threat vectors, SIEM log analysis, penetration testing methodologies, cryptography, and network traffic packet inspection (Wireshark).",
            "average_salary_range": "$80,000 - $145,000 / ₹9 - 25 LPA",
            "demand_level": "Very High",
            "icon_name": "ShieldCheck",
            "required_skills": [
                ("Cybersecurity Fundamentals", 5.0, "Required"),
                ("Linux", 4.5, "Required"),
                ("Python", 3.5, "Preferred"),
                ("Critical Thinking", 4.5, "Required"),
                ("Communication", 4.0, "Required")
            ]
        },
        {
            "title": "Data Analyst",
            "slug": "data-analyst",
            "category": "Data & Analytics",
            "description": "Translates quantitative datasets into executive business intelligence dashboards, charts, and optimization metrics.",
            "industry_expectations": "Advanced SQL querying, data cleaning with Pandas, PowerBI/Tableau dashboarding, and communicating statistical findings to non-technical stakeholders.",
            "average_salary_range": "$65,000 - $115,000 / ₹6 - 16 LPA",
            "demand_level": "High",
            "icon_name": "BarChart3",
            "required_skills": [
                ("SQL", 4.5, "Required"),
                ("Python", 4.0, "Required"),
                ("Communication", 4.5, "Required"),
                ("Problem Solving", 4.0, "Required"),
                ("Critical Thinking", 4.0, "Required")
            ]
        },
        {
            "title": "UI/UX Designer",
            "slug": "ui-ux-designer",
            "category": "Design & Product",
            "description": "Crafts accessible, intuitive, and aesthetically stunning user journeys, wireframes, prototypes, and design systems.",
            "industry_expectations": "Proficiency with Figma design tokens, user persona research, interactive prototyping, accessibility compliance, and close design-to-code handoff.",
            "average_salary_range": "$70,000 - $130,000 / ₹7 - 20 LPA",
            "demand_level": "High",
            "icon_name": "Palette",
            "required_skills": [
                ("Design Systems & UI", 5.0, "Required"),
                ("HTML", 3.5, "Preferred"),
                ("CSS", 4.0, "Required"),
                ("Communication", 4.5, "Required"),
                ("Critical Thinking", 4.0, "Required"),
                ("Teamwork", 4.5, "Required")
            ]
        }
    ]

    for career in careers_data:
        cid = db.execute("""
            INSERT INTO career_paths (title, slug, category, description, industry_expectations, average_salary_range, demand_level, icon_name)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            career["title"],
            career["slug"],
            career["category"],
            career["description"],
            career["industry_expectations"],
            career["average_salary_range"],
            career["demand_level"],
            career["icon_name"]
        ))
        
        for skill_name, req_level, importance in career["required_skills"]:
            sid = skill_map.get(skill_name)
            if sid:
                db.execute("""
                    INSERT INTO career_required_skills (career_id, skill_id, required_level, importance)
                    VALUES (?, ?, ?, ?)
                """, (cid, sid, req_level, importance))

    all_careers = db.query("SELECT id, title FROM career_paths")
    career_map = {c["title"]: c["id"] for c in all_careers}

    # 3. Learning Resources (Verified URLs)
    resources_data = [
        # Python
        ("Python", "Python 3 Official Documentation", "Comprehensive language reference, tutorials, and standard library guide.", "Official Documentation", "https://docs.python.org/3/tutorial/", "Beginner", "15 hours"),
        ("Python", "CS50's Introduction to Programming with Python (Harvard)", "Renowned Harvard introductory course teaching fundamental computational thinking.", "Free Online Course", "https://cs50.harvard.edu/python/", "Beginner", "40 hours"),
        ("Python", "Automate the Boring Stuff with Python", "Practical programming curriculum focused on automating everyday tasks.", "Practice Platform", "https://automatetheboringstuff.com/", "Intermediate", "25 hours"),
        # JavaScript & React
        ("JavaScript", "MDN Web Docs: Modern JavaScript", "Gold-standard web developer documentation covering ES6+, DOM manipulation, and asynchronous JS.", "Official Documentation", "https://developer.mozilla.org/en-US/docs/Web/JavaScript", "Beginner", "30 hours"),
        ("React", "Official React.dev Interactive Tutorial", "Modern React documentation emphasizing hooks, component state, and pure components.", "Official Documentation", "https://react.dev/learn", "Intermediate", "20 hours"),
        ("React", "FreeCodeCamp React Certification", "Comprehensive hands-on coding challenges building interactive front-end web apps.", "Free Online Course", "https://www.freecodecamp.org/learn/front-end-development-libraries/", "Intermediate", "45 hours"),
        # SQL & Databases
        ("SQL", "PostgreSQL Official Tutorial", "Structured guide to relational modeling, advanced joins, CTEs, and window functions.", "Official Documentation", "https://www.postgresqltutorial.com/", "Beginner", "20 hours"),
        ("SQL", "Mode Analytics Advanced SQL Tutorial", "Industry standard queries for data manipulation, aggregations, and business metrics.", "Practice Platform", "https://mode.com/sql-tutorial/", "Intermediate", "18 hours"),
        # Machine Learning & AI
        ("Machine Learning", "Google Machine Learning Crash Course", "Fast-paced, practical introduction to ML using TensorFlow APIs and real datasets.", "Free Online Course", "https://developers.google.com/machine-learning/crash-course", "Intermediate", "25 hours"),
        ("Machine Learning", "Scikit-Learn User Guide & API", "Official guide to classification, regression, clustering, and dimensional reduction.", "Official Documentation", "https://scikit-learn.org/stable/user_guide.html", "Intermediate", "30 hours"),
        ("Deep Learning", "Fast.ai: Practical Deep Learning for Coders", "Top-down approach to neural networks, computer vision, and NLP architectures.", "Free Online Course", "https://course.fast.ai/", "Advanced", "50 hours"),
        # Data Structures & Problem Solving
        ("Data Structures", "NeetCode DSA Roadmap", "Visual breakdowns and guided patterns for arrays, binary search, trees, and dynamic programming.", "Practice Platform", "https://neetcode.io/roadmap", "Intermediate", "60 hours"),
        ("Data Structures", "LeetCode Curated Blind 75", "Core algorithmic problems frequently tested in tier-1 tech interviews.", "Practice Platform", "https://leetcode.com/problem-list/top-interview-questions/", "Advanced", "45 hours"),
        # Docker & Cloud
        ("Docker", "Docker Official Getting Started Guide", "Learn containerization, Dockerfiles, multi-stage builds, and docker-compose.", "Official Documentation", "https://docs.docker.com/get-started/", "Beginner", "12 hours"),
        ("Cloud Computing", "AWS Free Tier & Well-Architected Framework", "Hands-on cloud architecture blueprints, EC2, S3, RDS, and Lambda.", "Official Documentation", "https://aws.amazon.com/architecture/well-architected/", "Intermediate", "35 hours"),
        # Professional
        ("Communication", "Google Technical Writing Courses", "Learn how to write clear, concise engineering documentation, design docs, and release notes.", "Free Online Course", "https://developers.google.com/tech-writing", "Beginner", "8 hours")
    ]

    for skill_name, title, desc, rtype, url, diff, dur in resources_data:
        sid = skill_map.get(skill_name)
        if sid:
            db.execute("""
                INSERT INTO learning_resources (skill_id, title, description, resource_type, url, difficulty, estimated_duration)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (sid, title, desc, rtype, url, diff, dur))

    # 4. Project Recommendations
    projects_data = [
        # AI/ML Engineer
        ("AI/ML Engineer", "Beginner", "House Price Prediction Engine", 
         "Develop a supervised regression model predicting real-estate values using linear regression and decision trees.",
         ["Python", "Pandas", "Scikit-Learn", "Matplotlib"],
         ["Data cleaning and imputation", "Feature scaling and encoding", "Cross-validation and RMSE evaluation"],
         "https://github.com/scikit-learn/scikit-learn", 18),
        ("AI/ML Engineer", "Intermediate", "Customer Churn Prediction Dashboard",
         "Build an end-to-end churn classification service using XGBoost with an interactive Streamlit UI.",
         ["Python", "XGBoost", "Streamlit", "SQL", "Docker"],
         ["Imbalanced dataset handling (SMOTE)", "ROC-AUC curves", "Containerized microservice packaging"],
         "https://github.com/streamlit/streamlit", 35),
        ("AI/ML Engineer", "Advanced", "Multi-Modal AI Document Question-Answering System",
         "Architect an enterprise RAG (Retrieval-Augmented Generation) pipeline embedding PDFs using LangChain and vector DB.",
         ["Python", "FastAPI", "Vector Database (Chroma/FAISS)", "Hugging Face Transformers", "Docker"],
         ["Dense retrieval embeddings", "Prompt engineering & Guardrails", "Asynchronous API serving"],
         "https://github.com/langchain-ai/langchain", 60),

        # Software Developer / Full Stack
        ("Full Stack Developer", "Beginner", "Interactive Task & Habit Tracker",
         "Develop a responsive Kanban-style productivity application with local storage and category filtering.",
         ["HTML", "CSS", "JavaScript", "React"],
         ["Component state management", "DOM rendering optimizations", "Responsive grid design"],
         "https://github.com/facebook/react", 15),
        ("Full Stack Developer", "Intermediate", "Real-Time Collaborative Code Snippet Hub",
         "Build a full-stack platform where developers can share syntax-highlighted code with live comments and tags.",
         ["React", "Node.js", "Express", "SQL", "Tailwind CSS"],
         ["Relational data modeling", "JWT token authentication", "RESTful API design and pagination"],
         "https://github.com/expressjs/express", 32),
        ("Full Stack Developer", "Advanced", "Cloud-Native E-Commerce Platform with Stripe",
         "Create an enterprise marketplace featuring cart checkout, inventory reservation, order webhooks, and Redis caching.",
         ["React", "FastAPI", "PostgreSQL", "Docker", "Stripe API"],
         ["Distributed database transactions", "Secure third-party webhook handling", "CI/CD deployment pipelines"],
         "https://github.com/tiangolo/fastapi", 55),

        # Data Scientist
        ("Data Scientist", "Beginner", "Exploratory Data Analysis on Global Weather Trends",
         "Analyze historical temperature anomalies using statistical summaries, correlation matrices, and Seaborn heatmaps.",
         ["Python", "Pandas", "Seaborn", "Jupyter"],
         ["Hypothesis testing", "Outlier detection", "Visual data communication"],
         "https://github.com/pandas-dev/pandas", 16),
        ("Data Scientist", "Intermediate", "E-Commerce Market Basket Association Analyzer",
         "Discover co-purchasing patterns and product affinity rules using the Apriori and FP-Growth algorithms.",
         ["Python", "SQL", "Mlxtend", "Plotly"],
         ["Association rule mining (Support, Confidence, Lift)", "Interactive network graph visualization"],
         "https://github.com/rasbt/mlxtend", 30),
        ("Data Scientist", "Advanced", "Healthcare Diagnostic Survival Analysis Model",
         "Model patient event risks using Cox proportional hazards and Kaplan-Meier estimators with clinical datasets.",
         ["Python", "Lifelines", "Scikit-Learn", "FastAPI"],
         ["Censored time-to-event data modeling", "Concordance index evaluation", "Model explainability with SHAP"],
         "https://github.com/slundberg/shap", 50)
    ]

    for career_title, diff, title, desc, techs, outcomes, starter, est_hrs in projects_data:
        cid = career_map.get(career_title)
        if cid:
            db.execute("""
                INSERT INTO project_recommendations (
                    career_id, difficulty, title, description, technologies_required,
                    learning_outcomes, github_starter_url, estimated_hours
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                cid, diff, title, desc, json.dumps(techs),
                json.dumps(outcomes), starter, est_hrs
            ))

    # 5. Interactive Assessment Questions
    assessment_questions = [
        # Python
        ("Python", "What is the primary difference between a Python list and a tuple?",
         ["Lists are immutable, tuples are mutable", "Lists are mutable, tuples are immutable", "Tuples cannot store strings", "Lists have O(1) membership lookup, tuples have O(N)"],
         1, "Intermediate", "Lists can be modified after creation (mutable), whereas tuples cannot be altered (immutable)."),
        ("Python", "Which method or keyword is used to handle runtime exceptions gracefully in Python?",
         ["catch / throw", "try / except / finally", "guard / recover", "rescue / ensure"],
         1, "Beginner", "Python uses try...except blocks for exception handling, optionally combined with else and finally."),
        ("Python", "What will `[x**2 for x in range(4) if x % 2 == 0]` evaluate to?",
         ["[0, 1, 4, 9]", "[0, 4]", "[1, 9]", "[4]"],
         1, "Intermediate", "The list comprehension evaluates x=0 -> 0 and x=2 -> 4."),

        # SQL
        ("SQL", "Which SQL clause is used to filter records resulting from a GROUP BY aggregation?",
         ["WHERE", "HAVING", "LIMIT", "FILTER BY"],
         1, "Intermediate", "HAVING filters groups created by GROUP BY, while WHERE filters individual rows before grouping."),
        ("SQL", "What is the result of a LEFT OUTER JOIN between Table A and Table B?",
         ["Only matching rows in both tables", "All rows from Table A, and matched rows from Table B (with NULLs for non-matches)", "All rows from Table B only", "Cartesian product of both tables"],
         1, "Beginner", "A LEFT JOIN preserves every row from the left table regardless of whether a matching record exists in the right table."),

        # JavaScript
        ("JavaScript", "What is the output of `typeof NaN` in standard JavaScript?",
         ["'undefined'", "'number'", "'nan'", "'object'"],
         1, "Intermediate", "In JavaScript, NaN (Not-a-Number) is formally a numeric data type per IEEE 754 specification."),
        ("JavaScript", "How do Promises solve the historical 'callback hell' problem in asynchronous JavaScript?",
         ["By running code synchronously in background threads", "By chaining sequential asynchronous operations using .then() and async/await", "By disabling the browser event loop", "By converting JSON objects to arrays"],
         1, "Intermediate", "Promises allow readable chaining and streamlined error propagation with .catch() or try/catch in async functions."),

        # React
        ("React", "What is the primary purpose of the `useEffect` hook in modern React?",
         ["To store global application state", "To perform side effects such as data fetching, subscriptions, and DOM mutations", "To style components using CSS classes", "To replace all JavaScript functions with JSX"],
         1, "Intermediate", "useEffect handles asynchronous data fetching, manual DOM operations, timers, and cleanup routines."),

        # Data Structures
        ("Data Structures", "What is the average time complexity of searching for an element in a balanced Binary Search Tree (BST)?",
         ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
         1, "Intermediate", "A balanced BST cuts the search space in half at each step, yielding logarithmic O(log N) average time complexity."),

        # Machine Learning
        ("Machine Learning", "Which metric is most appropriate for evaluating a classification model on an extremely imbalanced dataset?",
         ["Accuracy", "Precision-Recall AUC / F1-Score", "Mean Squared Error", "R-squared"],
         1, "Intermediate", "Accuracy is misleading with class imbalance (e.g., 99% majority class). Precision, Recall, and F1-score evaluate minority class detection accurately.")
    ]

    for skill_name, q, options, correct_idx, diff, exp in assessment_questions:
        sid = skill_map.get(skill_name)
        if sid:
            db.execute("""
                INSERT INTO assessments (skill_id, question, options, correct_option_index, difficulty, explanation)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (sid, q, json.dumps(options), correct_idx, diff, exp))

    # 6. Default Demo Accounts
    # Demo Admin
    admin_pw = get_password_hash("admin123")
    admin_id = db.execute("""
        INSERT INTO users (email, password_hash, full_name, role)
        VALUES ('admin@skillbridge.edu', ?, 'Dr. Sarah Mitchell', 'admin')
    """, (admin_pw,))

    # Demo Student
    student_pw = get_password_hash("password123")
    student_id = db.execute("""
        INSERT INTO users (email, password_hash, full_name, role)
        VALUES ('student@skillbridge.edu', ?, 'Alex Rivera', 'student')
    """, (student_pw,))

    # Student Profile
    ai_career_id = career_map.get("AI/ML Engineer")
    db.execute("""
        INSERT INTO student_profiles (
            user_id, college_name, degree, branch, current_academic_year,
            graduation_year, target_career_id, bio, github_url, linkedin_url, available_hours_per_week
        ) VALUES (?, 'Stanford University Institute of Technology', 'Bachelor of Technology (B.Tech)',
                  'Computer Science Engineering', '3rd Year', 2026, ?,
                  'Passionate CS junior aiming to build intelligent systems and transition into production AI/ML engineering.',
                  'https://github.com/alexrivera-demo', 'https://linkedin.com/in/alexrivera-demo', 18)
    """, (student_id, ai_career_id))

    # Seed Initial Student Skills for Alex Rivera (Realistic baseline)
    sample_student_skills = [
        ("Python", 3.0, "Intermediate", 1),
        ("SQL", 2.0, "Beginner", 0),
        ("Machine Learning", 1.5, "Beginner", 0),
        ("Data Structures", 3.5, "Intermediate", 1),
        ("Communication", 4.0, "Advanced", 0),
        ("Problem Solving", 3.5, "Intermediate", 0),
        ("Git", 3.0, "Intermediate", 0),
        ("HTML", 4.0, "Advanced", 0),
        ("CSS", 3.5, "Intermediate", 0),
        ("JavaScript", 3.0, "Intermediate", 0),
        ("Teamwork", 4.5, "Expert", 0)
    ]

    for s_name, rating, prof, verified in sample_student_skills:
        sid = skill_map.get(s_name)
        if sid:
            db.execute("""
                INSERT INTO student_skills (user_id, skill_id, rating, proficiency_level, verified)
                VALUES (?, ?, ?, ?, ?)
            """, (student_id, sid, rating, prof, verified))

    # Pre-generate roadmap for demo student so initial load is instantly impressive!
    try:
        from app.services.roadmap_engine import generate_rule_based_roadmap
        if ai_career_id:
            generate_rule_based_roadmap(student_id, ai_career_id, 18)
    except Exception as e:
        logger.warning(f"Demo roadmap pre-generation notice: {e}")

    logger.info("Database seeding completed successfully!")
