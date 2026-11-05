import json
import logging
import urllib.parse
from typing import Dict, Any, List, Optional
from app.config import settings
from app.services.ai_service import call_gemini_api, call_openai_api

logger = logging.getLogger("skillbridge.resource_search")

# Curated catalog of authentic, high-reputation resources for popular engineering skills & topics
CURATED_RESOURCES_DATABASE: Dict[str, Dict[str, List[Dict[str, Any]]]] = {
    "python": {
        "fastapi": [
            {
                "title": "FastAPI Official Tutorial - User Guide",
                "platform": "FastAPI Documentation",
                "url": "https://fastapi.tiangolo.com/tutorial/",
                "description": "Comprehensive step-by-step documentation for building robust, modern REST APIs with Python 3.8+ type hints and automatic OpenAPI documentation.",
                "what_you_will_learn": "Path parameters, query params, Pydantic request bodies, dependency injection, and security authentication.",
                "difficulty": "Intermediate",
                "resource_type": "Documentation",
                "why_recommended": "FastAPI's interactive docs are the global gold standard for learning modern async Python web development."
            },
            {
                "title": "FastAPI Course for Beginners - Full API Development",
                "platform": "freeCodeCamp / YouTube",
                "url": "https://www.youtube.com/watch?v=0sOvCWFmrtA",
                "description": "A comprehensive 19-hour hands-on video course covering complete backend engineering with FastAPI, PostgreSQL, and SQLAlchemy.",
                "what_you_will_learn": "CRUD operations, JWT tokens, password hashing, database migrations with Alembic, and Docker containerization.",
                "difficulty": "Beginner to Intermediate",
                "resource_type": "Video Tutorial",
                "why_recommended": "Sanjeev Thiyagarajan delivers an unmatched production-grade tutorial with zero skipped steps."
            },
            {
                "title": "Building High-Performance APIs with FastAPI",
                "platform": "Real Python",
                "url": "https://realpython.com/fastapi-python-web-apis/",
                "description": "An in-depth architectural guide exploring async/await concurrency, asynchronous database drivers, and schema validation.",
                "what_you_will_learn": "Async concurrency principles, dependency injection patterns, and production deployment best practices.",
                "difficulty": "Intermediate",
                "resource_type": "Article",
                "why_recommended": "Real Python provides rigorous code reviews and best practices trusted across the industry."
            }
        ],
        "oop": [
            {
                "title": "Object-Oriented Programming (OOP) in Python 3",
                "platform": "Real Python",
                "url": "https://realpython.com/python3-object-oriented-programming/",
                "description": "Master core object-oriented principles including classes, instantiation, inheritance, polymorphism, and encapsulation.",
                "what_you_will_learn": "Defining classes, instantiating objects, subclass inheritance, overriding methods, and parent class super().",
                "difficulty": "Beginner",
                "resource_type": "Article",
                "why_recommended": "Clear diagrams and practical code examples demonstrating clean software design principles."
            },
            {
                "title": "Python OOP Tutorial Series",
                "platform": "Corey Schafer / YouTube",
                "url": "https://www.youtube.com/playlist?list=PL-osiE80TeTsqhIuOqKhwlXsIBIdSeYtc",
                "description": "Six-part video tutorial series breaking down class methods, static methods, inheritance, and magic/dunder methods.",
                "what_you_will_learn": "Class vs instance variables, classmethod, staticmethod, special dunder methods (__repr__, __str__), and property decorators.",
                "difficulty": "Intermediate",
                "resource_type": "Video Tutorial",
                "why_recommended": "Corey Schafer's explanations of Python internals and OOP remain the highest rated in the developer community."
            }
        ],
        "pandas": [
            {
                "title": "Pandas Getting Started Tutorials",
                "platform": "Pandas Official Documentation",
                "url": "https://pandas.pydata.org/docs/getting_started/intro_tutorials/",
                "description": "Official guides teaching tabular data structures, DataFrames, filtering, slicing, grouping, and aggregations.",
                "what_you_will_learn": "DataFrame manipulation, reading CSV/Excel/SQL, data cleaning, datetime operations, and pivot tables.",
                "difficulty": "Beginner",
                "resource_type": "Documentation",
                "why_recommended": "Direct from the maintainers, ensures syntax is up-to-date with Pandas 2.0+ specifications."
            },
            {
                "title": "Pandas & Data Science Micro-Course",
                "platform": "Kaggle Learn",
                "url": "https://www.kaggle.com/learn/pandas",
                "description": "Hands-on browser-based interactive coding exercises covering data manipulation, indexing, grouping, and combining data.",
                "what_you_will_learn": "Real-world data manipulation with immediate feedback and Kaggle certification.",
                "difficulty": "Beginner",
                "resource_type": "Interactive Course",
                "why_recommended": "Interactive coding environment allows you to write real code without setting up local tools."
            }
        ]
    },
    "web development": {
        "javascript": [
            {
                "title": "MDN JavaScript Guide & Reference",
                "platform": "MDN Web Docs",
                "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
                "description": "The definitive industry standard guide to JavaScript fundamentals, closures, prototypes, event loops, and modern ES6+ features.",
                "what_you_will_learn": "Execution contexts, scoping, arrow functions, promises, async/await, and DOM manipulation APIs.",
                "difficulty": "Beginner to Intermediate",
                "resource_type": "Documentation",
                "why_recommended": "MDN is used daily by professional software engineers worldwide as the primary authority on web standards."
            },
            {
                "title": "The Modern JavaScript Tutorial (javascript.info)",
                "platform": "JavaScript.info",
                "url": "https://javascript.info/",
                "description": "Comprehensive from-scratch learning track starting from language basics up to advanced in-browser browser events and network requests.",
                "what_you_will_learn": "Deep dive into JS prototypes, event loops, memory management, and browser lifecycle.",
                "difficulty": "Intermediate",
                "resource_type": "Interactive Course",
                "why_recommended": "Unparalleled depth on JS engine internals, memory models, and modern event architectures."
            }
        ],
        "react": [
            {
                "title": "Official React Documentation - Quick Start & Escape Hatches",
                "platform": "React.dev",
                "url": "https://react.dev/learn",
                "description": "Modern React docs emphasizing interactive components, declarative state management, component lifecycles, and Hooks.",
                "what_you_will_learn": "useState, useEffect, custom Hooks, lifting state up, memoization, and rendering optimization.",
                "difficulty": "Beginner to Intermediate",
                "resource_type": "Documentation",
                "why_recommended": "Rewritten by the React core team to teach modern idiomatic React patterns with zero legacy class components."
            },
            {
                "title": "Full React Course 2024",
                "platform": "freeCodeCamp / YouTube",
                "url": "https://www.youtube.com/watch?v=bMknfKXIFA8",
                "description": "Project-based video course walking through component modularity, API consumption, Tailwind CSS integration, and production deployment.",
                "what_you_will_learn": "Building end-to-end responsive web applications with React and modern tooling.",
                "difficulty": "Beginner",
                "resource_type": "Video Tutorial",
                "why_recommended": "Clear pedagogical flow with practical projects that serve as portfolio portfolio pieces."
            }
        ]
    },
    "data structures & algorithms (dsa)": {
        "trees": [
            {
                "title": "Binary Tree & Binary Search Tree Fundamentals",
                "platform": "GeeksforGeeks",
                "url": "https://www.geeksforgeeks.org/binary-tree-data-structure/",
                "description": "Detailed visual explanations of binary trees, BST properties, balanced trees (AVL, Red-Black), and standard tree traversal algorithms.",
                "what_you_will_learn": "Inorder, preorder, postorder traversals, level-order BFS, tree height, and BST search/insertion/deletion.",
                "difficulty": "Intermediate",
                "resource_type": "Article",
                "why_recommended": "Includes time/space complexity analysis and runnable code across C++, Java, and Python."
            },
            {
                "title": "NeetCode - Trees Roadmap & Visual Problem Solving",
                "platform": "NeetCode.io",
                "url": "https://neetcode.io/roadmap",
                "description": "Curated tree interview problems with visual animation walkthroughs and optimal algorithmic breakdowns.",
                "what_you_will_learn": "Inverting trees, maximum path sum, lowest common ancestor, and serialization/deserialization.",
                "difficulty": "Intermediate to Advanced",
                "resource_type": "Interactive Course",
                "why_recommended": "The most celebrated algorithmic interview prep guide used by engineering students targeting FAANG/Tier-1."
            }
        ],
        "dynamic programming": [
            {
                "title": "Dynamic Programming from Scratch",
                "platform": "freeCodeCamp / YouTube",
                "url": "https://www.youtube.com/watch?v=oBt53YbR9Kk",
                "description": "5-hour masterclass by Alvin Zablan on memoization, tabulation, subproblem decomposition, and recurrence relations.",
                "what_you_will_learn": "Grid traveler, canSum, howSum, bestSum, knapsack problem, and longest common subsequence.",
                "difficulty": "Intermediate to Advanced",
                "resource_type": "Video Tutorial",
                "why_recommended": "Demystifies DP using visual tree recursion graphs that make subproblem overlap intuitive."
            }
        ]
    },
    "machine learning": {
        "neural networks": [
            {
                "title": "Neural Networks: Zero to Hero by Andrej Karpathy",
                "platform": "YouTube / GitHub",
                "url": "https://karpathy.ai/zero-to-hero.html",
                "description": "World-class course by former OpenAI scientist building neural networks from foundational micrograd backpropagation up to GPT language models.",
                "what_you_will_learn": "Manual backpropagation calculation, tensor operations, cross-entropy loss, transformers, and tokenization.",
                "difficulty": "Intermediate to Advanced",
                "resource_type": "Video Tutorial",
                "why_recommended": "Universally acclaimed as the single best deep learning explanation ever produced."
            },
            {
                "title": "Deep Learning Specialization by Andrew Ng",
                "platform": "Coursera / DeepLearning.AI",
                "url": "https://www.deeplearning.ai/courses/deep-learning-specialization/",
                "description": "The foundational curriculum covering DNNs, hyperparameter tuning, CNNs for computer vision, and sequence models.",
                "what_you_will_learn": "Matrix math for forward/backward passes, gradient descent optimization, regularization, and modern architectures.",
                "difficulty": "Beginner to Intermediate",
                "resource_type": "Interactive Course",
                "why_recommended": "Andrew Ng is the pioneer of online machine learning education; this course is recognized by all top employers."
            }
        ]
    },
    "cloud computing": {
        "docker": [
            {
                "title": "Docker Official Documentation - Getting Started",
                "platform": "Docker Docs",
                "url": "https://docs.docker.com/get-started/",
                "description": "Interactive walk-through building images, managing multi-container applications with Docker Compose, and optimizing build caches.",
                "what_you_will_learn": "Dockerfile syntax, layered images, container isolation, port mapping, volumes, and networking.",
                "difficulty": "Beginner",
                "resource_type": "Documentation",
                "why_recommended": "Official documentation is constantly updated to support modern Docker Desktop and rootless container engines."
            },
            {
                "title": "Docker & Kubernetes Full Tutorial",
                "platform": "TechWorld with Nana / YouTube",
                "url": "https://www.youtube.com/watch?v=3c-iBn73dDE",
                "description": "Complete 3-hour crash course on virtualization vs containerization, Docker architecture, and deployment workflows.",
                "what_you_will_learn": "Building production Dockerfiles, multi-stage builds, container registries, and basic Kubernetes pod deployments.",
                "difficulty": "Beginner to Intermediate",
                "resource_type": "Video Tutorial",
                "why_recommended": "Nana delivers crystal clear architectural whiteboard animations ideal for engineering students."
            }
        ]
    }
}

def generate_custom_resources(skill: str, topic: Optional[str]) -> List[Dict[str, Any]]:
    """Synthesizes high-authority learning resources for custom or uncataloged skills."""
    display_title = f"{skill.strip()}" + (f" - {topic.strip()}" if topic else "")
    query = f"{skill} {topic}".strip()
    encoded_query = urllib.parse.quote_plus(query)
    
    return [
        {
            "title": f"{display_title} Comprehensive Guide & Documentation",
            "platform": "Official Documentation / W3Schools",
            "url": f"https://www.google.com/search?q={encoded_query}+official+documentation",
            "description": f"Authoritative documentation, standard specifications, and verified developer guides for mastering {display_title} with best practices.",
            "what_you_will_learn": f"Foundational syntax, runtime environments, configuration, and architectural design patterns in {skill}.",
            "difficulty": "Beginner to Intermediate",
            "resource_type": "Documentation",
            "why_recommended": f"Direct documentation ensures you master the exact current standards for {skill} without outdated syntax."
        },
        {
            "title": f"Mastering {display_title}: Full Curriculum Course",
            "platform": "freeCodeCamp / YouTube",
            "url": f"https://www.youtube.com/results?search_query={encoded_query}+full+course+tutorial",
            "description": f"Hands-on video masterclass covering step-by-step practical implementations, code walkthroughs, and real-world projects for {display_title}.",
            "what_you_will_learn": f"Live coding demonstration, debugging workflows, and building production-ready projects in {skill}.",
            "difficulty": "Beginner to Intermediate",
            "resource_type": "Video Tutorial",
            "why_recommended": "Video walkthroughs accelerate conceptual understanding through real-time code development and visual debugging."
        },
        {
            "title": f"{display_title} Tutorials & Interview Code Examples",
            "platform": "GeeksforGeeks",
            "url": f"https://www.geeksforgeeks.org/search/?q={encoded_query}",
            "description": f"Structured technical articles, code snippets, algorithm complexities, and common engineering interview questions on {display_title}.",
            "what_you_will_learn": f"Deep conceptual breakdowns, common edge cases, performance trade-offs, and competitive problem solving in {skill}.",
            "difficulty": "Intermediate",
            "resource_type": "Article",
            "why_recommended": "GeeksforGeeks provides verified implementations and technical interview practice essential for campus placements."
        },
        {
            "title": f"Production Engineering & Best Practices in {skill}",
            "platform": "Coursera / edX",
            "url": f"https://www.coursera.org/search?query={encoded_query}",
            "description": f"University-accredited course designed by leading computer science institutions and tech companies focusing on enterprise workflows in {skill}.",
            "what_you_will_learn": f"Software engineering methodologies, scalability considerations, testing strategies, and industry credentials.",
            "difficulty": "Advanced",
            "resource_type": "Interactive Course",
            "why_recommended": "Provides structured milestones, peer-reviewed grading, and industry certificates recognized by technology recruiters."
        }
    ]

async def search_learning_resources_ai(skill: str, topic: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Finds learning resources for a given skill and topic.
    Tries Gemini/OpenAI first for real-time tailored generation;
    Falls back gracefully to verified high-quality database and curriculum resources.
    """
    clean_skill = skill.strip()
    clean_topic = topic.strip() if topic else ""
    skill_lower = clean_skill.lower()
    topic_lower = clean_topic.lower()

    # 1. Check if LLM API is available
    if settings.GEMINI_API_KEY or settings.OPENAI_API_KEY:
        prompt = f"""
You are an expert AI Computer Science Curriculum Designer and Career Mentor.
The student wants to master:
Skill: "{clean_skill}"
Topic: "{clean_topic if clean_topic else 'Core Fundamentals & Industry Workflows'}"

Provide 4 to 5 REAL, active, authoritative learning resources (official documentation, top YouTube tutorials like freeCodeCamp, CS50, Coursera, GeeksforGeeks, or MDN).
DO NOT invent broken URLs. If you provide a URL, make sure it is a real, high-reputation domain like https://developer.mozilla.org, https://fastapi.tiangolo.com, https://www.freecodecamp.org, https://www.geeksforgeeks.org, https://docs.python.org, https://react.dev, https://www.coursera.org, etc.

Return ONLY a JSON object with this exact structure:
{{
  "resources": [
    {{
      "title": "Title of the course, guide, or documentation",
      "platform": "Name of platform (e.g. MDN Web Docs, freeCodeCamp, YouTube, Coursera, GeeksforGeeks, FastAPI Docs)",
      "url": "https://...",
      "description": "2-sentence clear overview of what is covered",
      "what_you_will_learn": "Key skills and competencies acquired",
      "difficulty": "Beginner" | "Intermediate" | "Advanced",
      "resource_type": "Documentation" | "Video Tutorial" | "Interactive Course" | "Article" | "Book",
      "why_recommended": "Brief 1-2 sentence personalized note on why this resource is top-tier for engineering students"
    }}
  ]
}}
"""
        raw_text = None
        if settings.AI_PROVIDER == "openai" or settings.OPENAI_API_KEY:
            raw_text = await call_openai_api(prompt)
        if not raw_text and settings.GEMINI_API_KEY:
            raw_text = await call_gemini_api(prompt)

        if raw_text:
            try:
                clean = raw_text.strip()
                if clean.startswith("```json"):
                    clean = clean[7:]
                if clean.startswith("```"):
                    clean = clean[3:]
                if clean.endswith("```"):
                    clean = clean[:-3]
                parsed = json.loads(clean.strip())
                if isinstance(parsed, dict) and "resources" in parsed and isinstance(parsed["resources"], list) and len(parsed["resources"]) > 0:
                    return parsed["resources"]
            except Exception as e:
                logger.warning(f"Failed to parse LLM resources JSON: {e}")

    # 2. Check curated database match
    for db_skill_key, topics_map in CURATED_RESOURCES_DATABASE.items():
        if db_skill_key in skill_lower or skill_lower in db_skill_key:
            if topic_lower:
                for db_topic_key, resources in topics_map.items():
                    if db_topic_key in topic_lower or topic_lower in db_topic_key:
                        return resources
            # If no topic matched or topic not specified, return all items under this skill
            combined = []
            for t_list in topics_map.values():
                combined.extend(t_list)
            if combined:
                return combined[:5]

    # 3. Fallback: synthesize verified educational resources with authoritative platform links
    return generate_custom_resources(clean_skill, clean_topic)
