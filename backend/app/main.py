from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import json
import os
from typing import List, Dict, Any
import openai
from anthropic import Anthropic

app = FastAPI()

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

active_negotiations: Dict[str, Dict] = {}

class NegotiationScenario(BaseModel):
    scenario_description: str
    party1_role: str
    party2_role: str
    party1_goals: str
    party2_goals: str

class NegotiationMessage(BaseModel):
    speaker: str
    message: str
    timestamp: str

openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY", "dummy-key"))
anthropic_client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY", "dummy-key"))

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.post("/start-negotiation")
async def start_negotiation(scenario: NegotiationScenario):
    negotiation_id = f"neg_{len(active_negotiations) + 1}"
    
    active_negotiations[negotiation_id] = {
        "scenario": scenario.dict(),
        "messages": [],
        "status": "active",
        "deal_reached": False,
        "deal_summary": None
    }
    
    return {"negotiation_id": negotiation_id, "status": "started"}

@app.get("/negotiation/{negotiation_id}")
async def get_negotiation(negotiation_id: str):
    if negotiation_id not in active_negotiations:
        return {"error": "Negotiation not found"}
    
    return active_negotiations[negotiation_id]

@app.websocket("/ws/negotiation/{negotiation_id}")
async def websocket_endpoint(websocket: WebSocket, negotiation_id: str):
    await websocket.accept()
    
    if negotiation_id not in active_negotiations:
        await websocket.send_text(json.dumps({"error": "Negotiation not found"}))
        await websocket.close()
        return
    
    try:
        await run_negotiation_simulation(websocket, negotiation_id)
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for negotiation {negotiation_id}")

async def run_negotiation_simulation(websocket: WebSocket, negotiation_id: str):
    negotiation = active_negotiations[negotiation_id]
    scenario = negotiation["scenario"]
    
    agent1_persona = f"""You are {scenario['party1_role']} in a negotiation. 
    Your goals: {scenario['party1_goals']}
    Scenario: {scenario['scenario_description']}
    
    You should negotiate professionally but firmly for your interests. Keep responses concise (2-3 sentences max).
    When you reach a satisfactory deal, end your message with [DEAL_ACCEPTED]."""
    
    agent2_persona = f"""You are {scenario['party2_role']} in a negotiation.
    Your goals: {scenario['party2_goals']}
    Scenario: {scenario['scenario_description']}
    
    You should negotiate professionally but firmly for your interests. Keep responses concise (2-3 sentences max).
    When you reach a satisfactory deal, end your message with [DEAL_ACCEPTED]."""
    
    conversation_history = []
    max_rounds = 20
    
    for round_num in range(max_rounds):
        if round_num == 0:
            prompt = f"{agent1_persona}\n\nStart the negotiation by making your opening statement."
        else:
            prompt = f"{agent1_persona}\n\nConversation so far:\n" + "\n".join(conversation_history[-6:]) + f"\n\nRespond as {scenario['party1_role']}:"
        
        agent1_response = await get_ai_response(prompt, "agent1")
        conversation_history.append(f"{scenario['party1_role']}: {agent1_response}")
        
        message = {
            "speaker": scenario['party1_role'],
            "message": agent1_response,
            "timestamp": str(asyncio.get_event_loop().time())
        }
        
        negotiation["messages"].append(message)
        await websocket.send_text(json.dumps(message))
        await asyncio.sleep(2)  # Pause between messages
        
        if "[DEAL_ACCEPTED]" in agent1_response:
            await finalize_deal(websocket, negotiation_id, conversation_history)
            break
        
        prompt = f"{agent2_persona}\n\nConversation so far:\n" + "\n".join(conversation_history[-6:]) + f"\n\nRespond as {scenario['party2_role']}:"
        
        agent2_response = await get_ai_response(prompt, "agent2")
        conversation_history.append(f"{scenario['party2_role']}: {agent2_response}")
        
        message = {
            "speaker": scenario['party2_role'],
            "message": agent2_response,
            "timestamp": str(asyncio.get_event_loop().time())
        }
        
        negotiation["messages"].append(message)
        await websocket.send_text(json.dumps(message))
        await asyncio.sleep(2)  # Pause between messages
        
        if "[DEAL_ACCEPTED]" in agent2_response:
            await finalize_deal(websocket, negotiation_id, conversation_history)
            break

async def get_ai_response(prompt: str, agent_id: str) -> str:
    try:
        if agent_id == "agent1":
            if os.getenv("OPENAI_API_KEY", "dummy-key") == "dummy-key":
                return get_simulated_response(prompt, agent_id)
            
            response = openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=150,
                temperature=0.7
            )
            return response.choices[0].message.content.strip()
        else:
            if os.getenv("ANTHROPIC_API_KEY", "dummy-key") == "dummy-key":
                return get_simulated_response(prompt, agent_id)
            
            response = anthropic_client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=150,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.content[0].text.strip()
    except Exception as e:
        print(f"AI API error: {e}")
        return get_simulated_response(prompt, agent_id)

def get_simulated_response(prompt: str, agent_id: str) -> str:
    if "landlord" in prompt.lower():
        responses = [
            "I'm looking for $2,500/month for this property. It's in excellent condition and includes utilities.",
            "I could consider $2,400/month, but that's really my bottom line given the market rates.",
            "Let me think about $2,350. If you can sign a 2-year lease, I might be able to do that. [DEAL_ACCEPTED]"
        ]
    elif "tenant" in prompt.lower():
        responses = [
            "I appreciate the property, but $2,500 is above my budget. Could we discuss $2,200/month?",
            "I understand the market, but I'm a reliable tenant. How about $2,300/month?",
            "A 2-year lease at $2,350 works for me. That gives us both stability. [DEAL_ACCEPTED]"
        ]
    else:
        responses = [
            "I understand your position. Let me propose an alternative approach.",
            "That's interesting. I think we can find a middle ground here.",
            "I believe we can reach an agreement that works for both parties. [DEAL_ACCEPTED]"
        ]
    
    import hashlib
    hash_val = int(hashlib.md5(prompt.encode()).hexdigest(), 16)
    return responses[hash_val % len(responses)]

async def finalize_deal(websocket: WebSocket, negotiation_id: str, conversation_history: List[str]):
    negotiation = active_negotiations[negotiation_id]
    
    deal_summary = {
        "status": "completed",
        "final_terms": "Deal reached between parties",
        "conversation_length": len(conversation_history),
        "summary": "Both parties reached a mutually acceptable agreement."
    }
    
    negotiation["deal_reached"] = True
    negotiation["deal_summary"] = deal_summary
    negotiation["status"] = "completed"
    
    await websocket.send_text(json.dumps({
        "type": "deal_completed",
        "deal_summary": deal_summary
    }))

@app.get("/negotiation/{negotiation_id}/export")
async def export_deal_summary(negotiation_id: str):
    if negotiation_id not in active_negotiations:
        return {"error": "Negotiation not found"}
    
    negotiation = active_negotiations[negotiation_id]
    if not negotiation["deal_reached"]:
        return {"error": "No deal reached yet"}
    
    return {
        "negotiation_id": negotiation_id,
        "scenario": negotiation["scenario"],
        "messages": negotiation["messages"],
        "deal_summary": negotiation["deal_summary"]
    }
