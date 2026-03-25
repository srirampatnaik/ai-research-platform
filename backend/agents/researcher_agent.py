import os
from groq import Groq
from core.state import AgentState
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def analyze_data(state: AgentState) -> dict:
    """
    The Researcher Agent acts as a Senior Business Analyst.
    It reads the raw scraped data and search results, and synthesizes 
    it into a comprehensive business analysis.
    """
    user_input = state.get("user_input", "")
    search_results = state.get("search_results", "No search results provided.")
    scraped_content = state.get("scraped_content", "No scraped content provided.")
    
    current_logs = state.get("live_logs", [])
    current_logs.append("📊 Analyzing research data...")

    # Notice how we inject the raw tool data directly into the prompt context
    prompt = f"""
    You are an elite Business Analyst. 
    Your task is to analyze the following data to answer the user's request: "{user_input}"
    
    --- SEARCH RESULTS ---
    {search_results}
    
    --- SCRAPED WEBSITE DATA ---
    {scraped_content}
    -----------------------
    
    Based ONLY on the provided data, write a detailed business analysis. 
    Focus on competitors, market positioning, strengths, weaknesses, and strategic insights.
    Do not output JSON. Output a clean, well-structured text report.
    """

    try:
        # We use a slightly higher temperature (0.3) so the AI writes more fluid, analytical text
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
            temperature=0.3 
        )
        
        return {
            "raw_analysis": response.choices[0].message.content,
            "live_logs": current_logs
        }
        
    except Exception as e:
        return {
            "error": f"Researcher Error: {str(e)}",
            "live_logs": current_logs
        }

# --- Local Testing Block ---
if __name__ == "__main__":
    print("🧠 Testing Researcher Agent with dummy tool data...\n")
    
    # We fake the state to pretend the tools already ran
    dummy_state = {
        "user_input": "Analyze Notion's competitors",
        "search_results": "[1] Coda is a powerful document database that acts as a strong alternative to Notion. [2] Slite is an AI knowledge base optimized for fast team documentation.",
        "scraped_content": "Notion is the all-in-one workspace for your notes, tasks, wikis, and databases.",
        "live_logs": []
    }
    
    result = analyze_data(dummy_state)
    print("--- ANALYSIS OUTPUT ---")
    print(result.get("raw_analysis"))