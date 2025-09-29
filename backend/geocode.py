
# utils/geocoder.py

import requests
import os
import certifi # Import the certifi package

OPENCAGE_API_KEY = os.getenv("OPENCAGE_API_KEY")  # Set this in your .env file

def get_coordinates_from_address(address_dict):
    address_str = f"{address_dict.get('street', '')}, {address_dict.get('city', '')}, {address_dict.get('state', '')}, {address_dict.get('pincode', '')}, India"
    url = f"https://api.opencagedata.com/geocode/v1/json?q={address_str}&key={OPENCAGE_API_KEY}"
    
    try:
        response = requests.get(url, verify=certifi.where())
        response.raise_for_status()
        results = response.json().get("results")

        if results and len(results) > 0:
            geometry = results[0]["geometry"]
            return {"lat": geometry["lat"], "lng": geometry["lng"]}
        else:
            return None
    except requests.RequestException as e:
        print(f"Error getting coordinates: {e}")
        return None

# utils/geocoder.py

import requests
import os

OPENCAGE_API_KEY = os.getenv("OPENCAGE_API_KEY")  # Set this in your .env file

def get_coordinates_from_address(address_dict):
    address_str = f"{address_dict.get('street', '')}, {address_dict.get('city', '')}, {address_dict.get('state', '')}, {address_dict.get('pincode', '')}, India"
    url = f"https://api.opencagedata.com/geocode/v1/json?q={address_str}&key={OPENCAGE_API_KEY}"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        results = response.json().get("results")

        if results and len(results) > 0:
            geometry = results[0]["geometry"]
            return {"lat": geometry["lat"], "lng": geometry["lng"]}
        else:
            return None
    except requests.RequestException as e:
        print(f"Error getting coordinates: {e}")
        return None
