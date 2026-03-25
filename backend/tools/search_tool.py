import os
from tavily import TavilyClient
from dotenv import load_dotenv

# Load the API keys from the .env file
load_dotenv()

def search_web(query: str, max_results: int = 5) -> str:
    """
    Searches the web using Tavily API (optimized for LLMs).
    Returns highly relevant, clean text snippets.
    """
    api_key = os.getenv("TAVILY_API_KEY")
    if not api_key:
        return "Error: TAVILY_API_KEY is not set in the .env file."
    
    try:
        client = TavilyClient(api_key=api_key)
        # Tavily automatically filters out junk and returns clean context
        response = client.search(query=query, max_results=max_results)
        
        results = response.get("results", [])
        if not results:
            return f"No search results found for: {query}"
            
        formatted_results = f"--- Search Results for '{query}' ---\n\n"
        for i, res in enumerate(results, 1):
            formatted_results += f"[{i}] Title: {res.get('title')}\n"
            formatted_results += f"    URL: {res.get('url')}\n"
            formatted_results += f"    Content: {res.get('content')}\n\n"
            
        return formatted_results
        
    except Exception as e:
        return f"Error searching the web for '{query}': {str(e)}"

# --- Local Testing Block ---
if __name__ == "__main__":
    test_query = "top Notion competitors 2024"
    print(f"🔍 Testing Tavily Search Tool for: '{test_query}'...\n")
    
    result = search_web(test_query)
    print(result)