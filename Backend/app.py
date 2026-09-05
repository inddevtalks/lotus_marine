from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import json
import os

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

BASE_DIR = os.path.dirname(__file__)
EXCEL_FILE_PATH = os.path.join(BASE_DIR, 'fleet_data.xlsx')
EQUIPMENT_JSON_PATH = os.path.join(BASE_DIR, 'equipment_explorer.json')

# ------------------------------------------------------------------
# 1. Fleet Excel Endpoint
# ------------------------------------------------------------------
@app.route('/api/fleet', methods=['GET'])
def get_fleet_data():
    try:
        if not os.path.exists(EXCEL_FILE_PATH):
            return jsonify({'success': False, 'error': 'fleet_data.xlsx not found'}), 404

        df = pd.read_excel(EXCEL_FILE_PATH).fillna('')
        return jsonify({
            'success': True,
            'columns': list(df.columns),
            'data': df.to_dict(orient='records')
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ------------------------------------------------------------------
# 2. Dynamic Equipment Explorer JSON Endpoint
# ------------------------------------------------------------------
@app.route('/api/equipment-explorer', methods=['GET'])
def get_equipment_explorer():
    try:
        if not os.path.exists(EQUIPMENT_JSON_PATH):
            return jsonify({'success': False, 'error': 'equipment_explorer.json not found'}), 404

        with open(EQUIPMENT_JSON_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)

        return jsonify({'success': True, 'data': data})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5001)