from langgraph.graph import StateGraph, END
from core.state import AgentState
from agents.planner_agent import plan_research
from agents.researcher_agent import analyze_data
from agents.formatter_agent import format_report
from tools.search_tool import search_web
import json

# 1. Define the Tool Execution Node
def execute_tools(state: AgentState) -> dict:
    """
    This node acts as the 'Executor'. It takes the user's query,
    fires up the Tavily search tool, and grabs the data.
    """
    user_input = state.get("user_input", "")
    current_logs = state.get("live_logs", [])
    current_logs.append(f"🌐 Gathering web data for: '{user_input}'...")
    
    # Run the search tool
    results = search_web(user_input)
    
    return {
        "search_results": results,
        "live_logs": current_logs
    }

# 2. Define the Routing Logic
def route_after_planning(state: AgentState) -> str:
    """
    This is the traffic cop. It looks at the Planner's classification.
    If it's invalid, it aborts the mission. If it's valid, it continues to the tools.
    """
    intent = state.get("intent_classification", "invalid_input")
    if intent == "invalid_input":
        return "end_workflow"
    return "execute_tools"

# 3. Initialize the Graph
workflow = StateGraph(AgentState)

# 4. Add the Nodes (The "Rooms")
workflow.add_node("planner", plan_research)
workflow.add_node("tool_executor", execute_tools)
workflow.add_node("researcher", analyze_data)
workflow.add_node("formatter", format_report)

# 5. Add the Edges (The "Hallways" connecting the rooms)
workflow.set_entry_point("planner")

# Conditional edge based on the Gatekeeper's decision
workflow.add_conditional_edges(
    "planner",
    route_after_planning,
    {
        "execute_tools": "tool_executor",
        "end_workflow": END
    }
)

# Standard sequential edges
workflow.add_edge("tool_executor", "researcher")
workflow.add_edge("researcher", "formatter")
workflow.add_edge("formatter", END)

# 6. Compile the application
app = workflow.compile()


# --- Local Testing Block ---
if __name__ == "__main__":
    print("🚀 Initializing Autonomous Research Workflow...\n")
    
    # Let's run a full, end-to-end test!
    initial_state = {
        "user_input": "Who are the top competitors to Stripe?",
        "live_logs": []
    }
    
    print(f"User Request: {initial_state['user_input']}\n")
    print("--- LIVE LOGS ---")
    
    # Run the compiled LangGraph app
    final_state = app.invoke(initial_state)
    
    # Print the logs to see the agent's thought process
    for log in final_state.get("live_logs", []):
        print(log)
        
    print("\n--- FINAL JSON REPORT ---")
    if final_state.get("intent_classification") == "invalid_input":
        print("❌ Mission Aborted: Invalid Business Query")
    else:
        print(json.dumps(final_state.get("final_report"), indent=2))