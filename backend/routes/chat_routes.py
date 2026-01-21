from flask import Blueprint, request, jsonify
from services.chat_service import chat_service

chat_bp = Blueprint('chat_bp', __name__)

@chat_bp.route('/chat', methods=['POST'])
def chat():
    # In a real app, we would get user_id from the JWT token (g.user)
    # For now, we simulate it.
    data = request.get_json()
    query = data.get('message', '')
    
    if not query:
        return jsonify({'response': "I didn't hear anything."}), 400

    try:
        # Simulate User ID 1 for now if auth not passed
        user_id = 1 
        response = chat_service.process_query(user_id, query)
        return jsonify({'response': response}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
