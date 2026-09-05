import pandas as pd

fleet_data = {
    "Vessel ID": ["V-101", "V-102", "V-103", "V-104", "V-105"],
    "Vessel Name": ["MV Ocean Titan", "Pacific Pioneer", "Atlantis Horizon", "Nordic Explorer", "Sea Warrior"],
    "Vessel Type": ["Container Ship", "Bulk Carrier", "Oil Tanker", "LNG Carrier", "Cargo Vessel"],
    "IMO Number": [9482011, 9320144, 9510238, 9621109, 9201988],
    "Flag": ["Panama", "Liberia", "Marshall Islands", "Singapore", "Bahamas"],
    "Current Status": ["In Transit", "Docked", "At Anchor", "In Transit", "Under Maintenance"],
    "Speed (kn)": [18.4, 0.0, 0.5, 19.1, 0.0],
    "Destination": ["Rotterdam", "Singapore", "Houston", "Tokyo", "Hamburg"],
    "ETA": ["2026-08-18", "2026-08-12", "2026-08-22", "2026-08-15", "2026-08-30"],
}

df = pd.DataFrame(fleet_data)
df.to_excel("fleet_data.xlsx", index=False)
print("fleet_data.xlsx successfully created!")