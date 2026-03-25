import requests
from bs4 import BeautifulSoup

def scrape_website(url: str) -> str:
    """
    Scrapes a website and extracts clean, readable text.
    Strips out scripts, styles, and navigation menus to save LLM context window space.
    """
    # Use a standard User-Agent so websites don't immediately block us as a bot
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    try:
        # 10-second timeout prevents the agent from hanging forever
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove useless HTML elements that confuse the AI
        for element in soup(["script", "style", "nav", "footer", "header", "aside"]):
            element.extract()
            
        # Extract the visible text and clean up massive whitespace
        text = soup.get_text(separator=' ', strip=True)
        
        # Limit to 8000 characters to ensure we don't blow up the free Groq token limit
        if len(text) > 8000:
            text = text[:8000] + "\n... [Content Truncated]"
            
        return text
        
    except Exception as e:
        return f"Error scraping {url}: {str(e)}"

# --- Local Testing Block ---
# This allows us to test the tool directly without running the whole AI agent
if __name__ == "__main__":
    print("🌐 Testing Scraper on Y Combinator...")
    test_url = "https://www.ycombinator.com/"
    result = scrape_website(test_url)
    
    print("\n--- SCRAPED TEXT (First 500 chars) ---")
    print(result[:500])
    print("\n--------------------------------------")
    print(f"Total length extracted: {len(result)} characters")