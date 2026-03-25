import os
import json
from groq import Groq
from core.state import AgentState
from dotenv import load_dotenv

load_dotenv()

# Initialize the Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def plan_research(state: AgentState) -> dict:
    """
    The Planner Agent analyzes the user input, classifies the intent,
    and generates a step-by-step research plan.
    """
    user_input = state.get("user_input", "")
    
    # We append a live log so the frontend UI knows what the AI is doing
    current_logs = state.get("live_logs", [])
    current_logs.append("🧠 Planning research strategy...")

    prompt = f"""
    You are a strict Business Research Classifier. Your ONLY job is to classify the user input into exactly one of three categories, and create a research plan ONLY if it is a legitimate business query.

    Categories:
    - 'valid_company': Researching a specific company, competitor, or brand.
    - 'topic_research': Researching a business market, industry, or corporate trend.
    - 'invalid_input': EVERYTHING ELSE. Recipes, coding help, casual chat, personal tasks, greetings, etc.

    CRITICAL RULE: Do NOT invent business justifications for non-business queries. "how to bake a cake" is 'invalid_input', not a baking industry analysis.

    --- EXAMPLES ---
    Input: "Analyze Notion's competitors"
    Output: {{"intent_classification": "valid_company", "research_plan": ["Identify Notion's top competitors", "Analyze their core features", "Compare pricing models"]}}

    Input: "Top AI startups in India"
    Output: {{"intent_classification": "topic_research", "research_plan": ["Search for recent Indian AI startup funding", "List top 5 companies", "Summarize their main products"]}}

    Input: "how to bake a chocolate cake"
    Output: {{"intent_classification": "invalid_input", "research_plan": []}}

    Input: "hello there"
    Output: {{"intent_classification": "invalid_input", "research_plan": []}}
    ----------------

    Now, classify this user input: "{user_input}"
    
    OUTPUT FORMAT: Return STRICTLY valid JSON matching the format above. Do not include markdown, backticks, or extra text.
    """

    try:
        # Call the fast Llama 3.1 8b model
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
            temperature=0.1, # Low temperature for highly deterministic, JSON-safe output
            response_format={"type": "json_object"} # Force Groq to return valid JSON
        )
        
        # Parse the JSON response
        result = json.loads(response.choices[0].message.content)
        
        # Return the specific fields to update the LangGraph state
        return {
            "intent_classification": result.get("intent_classification", "invalid_input"),
            "research_plan": result.get("research_plan", []),
            "live_logs": current_logs
        }
        
    except Exception as e:
        return {
            "intent_classification": "invalid_input",
            "error": f"Planner Error: {str(e)}",
            "live_logs": current_logs
        }

# --- Local Testing Block ---
if __name__ == "__main__":
    print("🧪 Testing Planner Agent with custom inputs...\n")
    
    # Test 1: A broad market research topic
    test_state_1 = {
        "user_input": "What are the biggest trends in Fintech for 2026?", 
        "live_logs": []
    }
    print(f"Input: {test_state_1['user_input']}")
    print(json.dumps(plan_research(test_state_1), indent=2))
    print("-" * 40)
    
    # Test 2: A tricky invalid input (Asking for code instead of business research)
    test_state_2 = {
        "user_input": "Can you write a Python script to scrape Notion's website?", 
        "live_logs": []
    }
    print(f"Input: {test_state_2['user_input']}")
    print(json.dumps(plan_research(test_state_2), indent=2))