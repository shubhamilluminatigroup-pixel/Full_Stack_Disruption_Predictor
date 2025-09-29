import json
import requests
import os
import re
from sqlalchemy.orm import Session
from models import Truck, Shipment
import google.generativeai as genai
import random

# ===================== CONFIGURE GEMINI ===================== #
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Define Agent Models
# Agent 1: The Route Planner Agent
route_planner_model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    system_instruction=(
        "You are a logistics agent with a single, unyielding mission: create optimal route plans that **NEVER** exceed truck capacity. "
        "Think of a truck's capacity as an unmovable wall—you cannot go over it, under it, or around it. "
        "Your plan is invalid and worthless if any truck's total weight or volume utilization is over 100%. "
        "The plan must adhere to the following rules: "
        "1. Each shipment must be assigned to at most one truck. "
        "2. Prioritize combining shipments with the same origin. "
        "3. Group shipments with geographically near destinations for efficient multi-stop routes. "
        "4. **CRITICALLY IMPORTANT:** The sum of the 'weight' for all assigned shipments MUST be less than or equal to the truck's 'capacity_kg'. "
        "5. **CRITICALLY IMPORTANT:** The sum of the 'volume' for all assigned shipments MUST be less than or equal to the truck's 'capacity_volume'. "
        "6. Do not assign shipments to a truck if it will cause any of its capacity limits to be exceeded. "
        "7. Only return a plain JSON array of route plans. Do not include any explanation, notes, or markdown. "
        "The format must be: [{\"truck_number\": \"RJ14AB1234\", \"shipment_ids\": [\"shipment1\", \"shipment2\"]}]"
    )
)

# Agent 2: The Capacity Validator Agent
capacity_validator_model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    system_instruction=(
        "You are a logistics agent specializing in validating truck capacity. "
        "Your task is to check a proposed route plan against truck capacity limits. "
        "You will be given the full truck and shipment data, and a proposed route plan. "
        "Check each truck's total assigned weight and volume. "
        "If a truck's capacity is exceeded, return a plain JSON object with the truck number and the type of capacity exceeded and the shipment number (weight or volume). "
        "If all trucks in the plan are within their capacity limits, return a plain JSON object with a single key 'status' and value 'validated'."
        "Example of success: {\"status\": \"validated\"}"
        "Example of failure: {\"status\": \"capacity_exceeded\", \"truck_number\": \"RJ14AB1234\", \"exceeded_type\": \"weight\"}"
    )
)

# Agent 3: The Plan Finalizer Agent
plan_finalizer_model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    system_instruction=(
        "You are a logistics agent specializing in finalizing and confirming route plans. "
        "Your task is to receive a validated route plan and prepare it for a database commit. "
        "You will confirm that the plan is complete and correctly formatted. "
        "Once confirmed, you will return a plain JSON array identical to the input, signaling that it is ready for database update. "
        "Do not modify the input. Do not add any notes or markdown."
    )
)

# ===================== FETCH DB DATA ===================== #
def fetch_truck_shipment_data(db: Session):
    trucks = db.query(Truck).all()
    shipments = db.query(Shipment).all()
    return trucks, shipments

# ===================== FORMAT LLM PROMPT ===================== #
def format_input_for_llm(trucks, shipments):
    data = {
        "trucks": [
            {
                "id": str(truck.truck_id),
                "truck_number": truck.registration_number,
                "capacity_weight": truck.capacity_kg,
                "capacity_volume": truck.available_volume_cubic_m,
            } for truck in trucks
        ],
        "shipments": [
            {
                "id": str(shipment.shipment_id),
                "origin_address_city": shipment.origin_address.get("city"),
                "destination_address_city": shipment.destination_address.get("city"),
                "weight": shipment.weight,
                "volume": shipment.volume,
            } for shipment in shipments
        ]
    }
    return data

# ===================== AGENT INTERACTION FUNCTIONS ===================== #
def call_agent_api(agent_model, prompt_data) -> str:
    try:
        response = agent_model.generate_content(json.dumps(prompt_data))
        return response.text
    except Exception as e:
        raise RuntimeError(f"Agent API call failed: {e}")

def get_optimal_route_plan(db: Session):
    try:
        # Step 1: Fetch data from DB
        trucks, shipments = fetch_truck_shipment_data(db)
        formatted_data = format_input_for_llm(trucks, shipments)

        shipment_data_map = {str(s.shipment_id): s for s in shipments}
        truck_data_map = {t.registration_number: t for t in trucks}

        max_attempts = 10 # Increased attempts for more chances to learn
        previous_failure_message = "" # Initialize empty failure message

        for attempt in range(max_attempts):
            print(f"Attempt {attempt + 1}: Generating new route plan...")
            
            # Step 2: Call Route Planner Agent
            # The prompt now includes previous failure feedback
            llm_prompt = {
                "trucks": formatted_data["trucks"],
                "shipments": formatted_data["shipments"],
                "previous_failure": previous_failure_message
            }
            raw_plan_response = call_agent_api(route_planner_model, llm_prompt)

            try:
                cleaned_plan_response = raw_plan_response.strip()
                json_match = re.search(r"(\[.*\])", cleaned_plan_response, re.DOTALL)
                
                if not json_match:
                    raise ValueError("No valid JSON array found in Route Planner's response.")
                
                json_string_to_load = json_match.group(1)
                route_plan = json.loads(json_string_to_load)
                
                if not isinstance(route_plan, list):
                    raise TypeError("Expected a JSON array from Route Planner.")
            except (json.JSONDecodeError, TypeError, ValueError) as e:
                print(f"Error parsing Route Planner response: {e}")
                previous_failure_message = f"Failed to generate a valid JSON. Response was: {raw_plan_response}"
                continue

            # Step 3: Capacity Validator Agent - Check the plan
            print("Submitting plan to Capacity Validator...")
            validation_data = {
                "trucks": formatted_data["trucks"],
                "shipments": formatted_data["shipments"],
                "proposed_plan": route_plan
            }
            
            validation_response_raw = call_agent_api(capacity_validator_model, validation_data)
            
            try:
                cleaned_validator_response = validation_response_raw.strip()
                json_match_validator = re.search(r"(\{.*\})", cleaned_validator_response, re.DOTALL)
                
                if not json_match_validator:
                    raise ValueError("No valid JSON object found in Validator's response.")
                
                json_string_to_load_validator = json_match_validator.group(1)
                validation_result = json.loads(json_string_to_load_validator)
                
            except (json.JSONDecodeError, ValueError) as e:
                print(f"Error parsing Validator response: {e}. Raw response: '{validation_response_raw}'")
                previous_failure_message = f"Validator failed to provide a valid JSON. Raw response: {validation_response_raw}"
                continue

            if validation_result.get("status") == "validated":
                print("Capacity Validator confirmed the plan is valid! ✅")
                
                # Step 4: Plan Finalizer Agent - Confirm and prepare for DB update
                print("Submitting validated plan to Plan Finalizer...")
                finalizer_response_raw = call_agent_api(plan_finalizer_model, route_plan)
                
                try:
                    final_route_plan = json.loads(finalizer_response_raw.strip())
                    if not isinstance(final_route_plan, list):
                        raise TypeError("Expected a JSON array from Plan Finalizer.")
                except (json.JSONDecodeError, TypeError) as e:
                    print(f"Error parsing Finalizer response: {e}")
                    raise ValueError("Final plan could not be processed.")

                for plan in final_route_plan:
                    truck_number = plan.get("truck_number")
                    shipment_ids = plan.get("shipment_ids", [])
                    
                    if truck_number not in truck_data_map:
                        print(f"Skipping update for unknown truck: {truck_number}")
                        continue

                    for sid in shipment_ids:
                        if sid in shipment_data_map:
                            shipment = shipment_data_map[sid]
                            shipment.vehicle_id = truck_data_map[truck_number].registration_number
                            print(f"Updated shipment {sid} with vehicle ID {shipment.vehicle_id}")
                        else:
                            print(f"Shipment ID {sid} not found in DB data.")
                
                db.commit()
                print("Shipment records updated and committed to DB. 🥳")
                return final_route_plan

            else:
                failure_reason = f"Capacity validation failed. Reason: {validation_result.get('exceeded_type')} on truck {validation_result.get('truck_number')}. "
                print(failure_reason)
                # Store the specific reason for the next attempt
                previous_failure_message = failure_reason + " Please fix this specific capacity issue in the next plan."

        print("Failed to find a valid route plan after multiple attempts.")
        return None

    except Exception as e:
        print(f"An unexpected error occurred during route optimization: {e}")
        return {"error": "An unexpected server error occurred during optimization."}