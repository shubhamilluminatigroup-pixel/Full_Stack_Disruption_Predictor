# Full_Stack_Disruption_Predictor
This analyze events across the shipment leg and give disruption prediction

The system utilize gemini api to surf internet and analyse the risk based on news like political unrest, weather etc

The system fetch the data from DB and convert into JSON Prompt. the JSON prompt contains shipment source and destination. the JSon prompt is then fed to the gemini to analyse the risk.

the Respon of Gemini is updated into the DB and shown to user front end
