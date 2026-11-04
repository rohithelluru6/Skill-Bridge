import os
import json
import logging
import httpx
from typing import Dict, Any, List, Optional
from app.config import settings
from app.database import db
from app.services.gap_analysis import calculate_skill_gap
from app.services.roadmap_engine import generate_rule_based_roadmap

logger = logging.getLogger("skillbridge.ai")

async def call_gemini_api(prompt: str) -> Optional[str]:
    """Invokes Google Gemini API if GEMINI_API_KEY is present."""
    if not settings.GEMINI_API_KEY:
        return None
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 2048
        }
    }
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(url, json=payload)
            if response.status_code == 200:
                data = response.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                return text
            else:
                logger.warning(f"Gemini API returned status {response.status_code}: {response.text}")
                return None
    except Exception as e:
        logger.warning(f"Gemini API invocation failed: {e}")
        return None

async def call_openai_api(prompt: str) -> Optional[str]:
    """Invokes OpenAI API if OPENAI_API_KEY is present."""
    if not settings.OPENAI_API_KEY:
        return None
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": "You are an expert AI Career Mentor for engineering students. Output valid JSON only."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3,
        "response_format": {"type": "json_object"}
    }
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            if response.status_code == 200:
                data = response.json()
                return data["choices"][0]["message"]["content"]
            else:
                logger.warning(f"OpenAI API error {response.status_code}: {response.text}")
                return None
    except Exception as e:
        logger.warning(f"OpenAI API call failed: {e}")
        return None

async def analyze_skill_gap_ai(user_id: int, career_id: int) -> Dict[str, Any]:
    """
    Combines deterministic gap calculations with AI-enhanced narrative insights.
    Falls back smoothly to our deterministic engine when external API keys are unset.
    """
    # 1. Compute deterministic base gaps
    gap_result = calculate_skill_gap(user_id, career_id)
    
    # 2. Check if LLM API is available
    has_api_key = bool(settings.GEMINI_API_KEY or settings.OPENAI_API_KEY)
    ai_narrative = None
    provider_used = "Built-in Rule-Based Engine (Demo Mode)"

    if has_api_key:
        prompt = f"""
You are a senior tech lead and career coach. Review the following student skill gap data for the target career '{gap_result['career_title']}':
Readiness Score: {gap_result['overall_readiness_score']}%
Strengths: {json.dumps(gap_result['strengths'])}
Weaknesses: {json.dumps(gap_result['weaknesses'])}
Skill Gaps: {json.dumps(gap_result['gaps_breakdown'])}

Provide an inspiring, highly practical analysis in JSON format with keys:
- "ai_summary": Short 2-3 sentence overview of their positioning.
- "strategic_advice": 3 bullet points for tactical execution.
- "hiring_perspective": What recruiters for this role will look for in portfolios.
- "estimated_time_to_ready_months": Realistic months to bridge the gap.
"""
        raw_ai_text = None
        if settings.AI_PROVIDER == "openai" or settings.OPENAI_API_KEY:
            raw_ai_text = await call_openai_api(prompt)
            if raw_ai_text:
                provider_used = "OpenAI GPT-4o-mini"
        
        if not raw_ai_text and settings.GEMINI_API_KEY:
            raw_ai_text = await call_gemini_api(prompt)
            if raw_ai_text:
                provider_used = "Google Gemini 1.5 Flash"

        if raw_ai_text:
            try:
                # Clean code fences if present
                clean = raw_ai_text.strip()
                if clean.startswith("```json"):
                    clean = clean[7:]
                if clean.startswith("```"):
                    clean = clean[3:]
                if clean.endswith("```"):
                    clean = clean[:-3]
                ai_narrative = json.loads(clean.strip())
            except Exception as parse_err:
                logger.warning(f"Failed to parse AI output: {parse_err}")

    # Fallback narrative if AI wasn't invoked or failed
    if not ai_narrative:
        high_gaps = [g['skill_name'] for g in gap_result['gaps_breakdown'] if g['priority'] == 'High Priority']
        top_weakness = high_gaps[0] if high_gaps else "advanced core workflows"
        ai_narrative = {
            "ai_summary": (
                f"Your profile shows a solid technical foundation with {gap_result['overall_readiness_score']}% alignment for {gap_result['career_title']}. "
                f"Prioritizing {top_weakness} will dramatically boost your job readiness for top internships."
            ),
            "strategic_advice": [
                f"Focus on the {len(gap_result['weaknesses'])} high-priority gaps first before moving to elective frameworks.",
                "Build end-to-end projects with live deployments rather than isolated tutorial exercises.",
                "Maintain consistent coding commit activity on GitHub to demonstrate daily engineering discipline."
            ],
            "hiring_perspective": (
                f"Hiring managers for {gap_result['career_title']} roles prioritize demonstrable project work, "
                "algorithmic problem-solving, and clean, readable code over credentials alone."
            ),
            "estimated_time_to_ready_months": 4 if gap_result['overall_readiness_score'] > 60 else 6
        }

    gap_result["ai_insights"] = ai_narrative
    gap_result["ai_provider"] = provider_used
    gap_result["is_live_ai"] = provider_used != "Built-in Rule-Based Engine (Demo Mode)"
    
    return gap_result

async def generate_career_roadmap_ai(user_id: int, career_id: int, available_hours: int = 15) -> Dict[str, Any]:
    """
    Generates a personalized, structured 5-phase career roadmap.
    Persists tasks to the database so the student can check them off.
    """
    # 1. Compute gap base
    gap_data = await analyze_skill_gap_ai(user_id, career_id)
    
    # 2. Build structured roadmap
    roadmap_data = generate_rule_based_roadmap(user_id, career_id, available_hours, gap_data)
    
    roadmap_data["ai_insights"] = gap_data.get("ai_insights")
    roadmap_data["ai_provider"] = gap_data.get("ai_provider")
    roadmap_data["is_live_ai"] = gap_data.get("is_live_ai")
    
    return roadmap_data
