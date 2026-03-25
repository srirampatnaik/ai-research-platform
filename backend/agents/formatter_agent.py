import os
import json
from groq import Groq
from core.state import AgentState
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def format_report(state: AgentState) -> dict:
    """
    The Formatter Agent takes the raw markdown analysis and converts it 
    into a strict JSON structure for the Next.js frontend.
    """
    raw_analysis = state.get("raw_analysis", "")
    
    current_logs = state.get("live_logs", [])
    current_logs.append("📝 Formatting final JSON report...")

    prompt = f"""
    You are a strict JSON formatting tool. 
    Take the following business analysis and extract the key points into a strict JSON object.
    
    --- RAW ANALYSIS ---
    {raw_analysis}
    --------------------
    
    You MUST extract the data into this EXACT JSON structure:
    {{
        "subject": "The company or main topic",
        "executive_summary": "A 2-3 sentence summary",
        "competitors_or_key_players": ["Name 1", "Name 2"],
        "strengths_or_advantages": ["Point 1", "Point 2"],
        "weaknesses_or_challenges": ["Point 1", "Point 2"],
        "strategic_insights": ["Insight 1", "Insight 2"]
    }}
    
    If the raw analysis is missing a specific section (e.g., no weaknesses mentioned), return an empty array [] for that key.
    Return ONLY valid JSON.
    """

    try:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
            temperature=0.1, # Extremely low temperature for strict JSON
            response_format={"type": "json_object"}
        )
        
        # Parse the JSON so it's a real Python dictionary in our state
        final_json = json.loads(response.choices[0].message.content)
        
        return {
            "final_report": final_json,
            "live_logs": current_logs
        }
        
    except Exception as e:
        return {
            "error": f"Formatter Error: {str(e)}",
            "live_logs": current_logs
        }

# --- Local Testing Block ---
if __name__ == "__main__":
    print("📋 Testing Formatter Agent...\n")
    
    # We feed it a messy, abbreviated markdown string to see if it cleans it up
    dummy_state = {
        "raw_analysis": "Notion is a great tool. Its main competitors are Coda and Evernote. A big strength is its database flexibility, but it can be slow to load on mobile. Strategically, they should improve offline mode.",
        "live_logs": []
    }
    
    result = format_report(dummy_state)
    print(json.dumps(result.get("final_report"), indent=2))