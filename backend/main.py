from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv

# Import our compiled LangGraph workflow
from workflow.graph import app as research_agent

load_dotenv()

# Initialize FastAPI
app = FastAPI(
    title="Business Research Agent API",
    version="1.0.0",
    description="API for autonomous market intelligence"
)

# Enable CORS so your Next.js frontend can make requests to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, change this to your Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the data structure we expect from the frontend
class ResearchRequest(BaseModel):
    query: str

@app.get("/")
def home():
    return {"message": "Business Research Agent API is live!"}

@app.post("/api/research")
async def run_research(request: ResearchRequest):
    """
    Takes a query from the frontend, runs the LangGraph agent, 
    and returns the structured JSON report.
    """
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    try:
        # Initialize the state for the graph
        initial_state = {
            "user_input": request.query,
            "live_logs": []
        }
        
        # Run the agent (this takes a few seconds)
        final_state = research_agent.invoke(initial_state)
        
        # Check if the Gatekeeper blocked it
        if final_state.get("intent_classification") == "invalid_input":
            return {
                "status": "error",
                "message": "Invalid business query. Please ask about a company, competitor, or market trend.",
                "logs": final_state.get("live_logs", [])
            }
            
        # Return the beautiful JSON report!
        return {
            "status": "success",
            "report": final_state.get("final_report", {}),
            "logs": final_state.get("live_logs", [])
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))