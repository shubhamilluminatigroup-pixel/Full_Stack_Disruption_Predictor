
# shipment_delay_checker.py

import json
import re
from sqlalchemy.orm import Session
from models import Shipment
import google.generativeai as genai

# ===================== CONFIGURE GEMINI ===================== #
genai.configure(api_key="AIzaSyBaTQ2mApkSX5pXDtjvki1QYnSG41zIzXY")

model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    system_instruction=(
        
        "You are a logistics risk and delay analysis assistant. "
        "All the shipment must follow multimodal shipment procedure"
        "You will be given a shipment with source and destination cities. "
        "Search the web for most recent, relevant news, events, weather, strikes, road closures, or political/regulatory disruptions that may delay it. "
        "Return ONLY JSON in the following format (no explanations, notes, or markdown):\n"
        "[\n"
        "  {\n"
        "    \"shipment_id\": \"string\",\n"
        "    \"possible_delay_reason\": \"string\",\n"
        "    \"estimated_delay_hours\": number,\n"
        "    \"normal_duration_hours\": number,\n"
        "    \"expected_duration_hours\": number\n"
        "  }\n"
        "]\n"
        "ensure that hours are practical"
        "in the multi modal shipment , check for land, sea leg for disruption and hours should be calculated based on total of land and sea leg"
        "Do not include explanations or markdown."
        "only conisder land and sea transport"
    )
)

# ===================== FETCH ONE BY ONE ===================== #
def fetch_shipment_info(db: Session):
    """Fetch all shipments with city info."""
    shipments = db.query(
        Shipment.shipment_id,
        Shipment.origin_address,
        Shipment.destination_address
    ).all()

    return [
        {
            "shipment_id": str(s.shipment_id),
            "source": s.origin_address.get("city") if s.origin_address else None,
            "destination": s.destination_address.get("city") if s.destination_address else None
        }
        for s in shipments
    ]

# ===================== FORMAT PROMPT ===================== #
def format_prompt_for_single_shipment(shipment):
    return f"""
Here is the shipment that needs risk assessment for multi modal shipments:

{json.dumps(shipment, indent=2)}
Please analyze potential delays based on current events, weather, or other disruptions.
also ensure the normal duration hour should be practical and based on real life shipments
"""

# ===================== CALL GEMINI ===================== #
def call_gemini_with_web(prompt: str) -> str:
    try:
        print(f"📡 Sending to Gemini: {prompt}")
        response = model.generate_content(prompt)
        print(f"✅ Gemini response: {response.text}")
        return response.text
    except Exception as e:
        raise RuntimeError(f"Gemini API call failed: {e}")

# ===================== EXTRACT JSON ===================== #
def extract_json(text: str) -> str:
    json_match = re.search(r"(\[.*\])", text, re.DOTALL)
    if not json_match:
        raise ValueError("No valid JSON structure found in Gemini response")
    return json_match.group(1)

# ===================== MAIN PROCESS ===================== #
def assess_shipment_delays(db: Session):
    shipments = fetch_shipment_info(db)
    if not shipments:
        print("No shipments found.")
        return []

    results = []

    for shipment in shipments:
        try:
            # Step 1: Build prompt
            prompt = format_prompt_for_single_shipment(shipment)

            # Step 2: Send to Gemini
            llm_response = call_gemini_with_web(prompt)

            # Step 3: Extract JSON
            cleaned_json = extract_json(llm_response)
            delay_info_list = json.loads(cleaned_json)

            # Step 4: Update DB right away
            # Step 4: Update DB right away with full JSON
            for delay_info in delay_info_list:
                shipment_id = delay_info.get("shipment_id")

                shipment_obj = db.query(Shipment).filter_by(shipment_id=shipment_id).first()
            if shipment_obj:
                # Store the full JSON as a string
                shipment_obj.regulatory_flags = json.dumps(delay_info, ensure_ascii=False)
                db.commit()
                print(f"📝 Updated shipment {shipment_id} → Stored full delay info JSON")

            results.extend(delay_info_list)

        except Exception as e:
            print(f"❌ Error processing shipment {shipment.get('shipment_id')}: {e}")
            db.rollback()  # Ensure DB stays clean if something goes wrong

    print("🎯 All shipments processed.")
    return results

