import os
from flask import Flask, render_template, request, jsonify
import google.generativeai as genai
from dotenv import load_dotenv
from flask_cors import CORS

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173"],
        "methods": ["POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Configure Gemini API
# Note: It's recommended to use environment variables for API keys
genai.configure(api_key='AIzaSyBCxcG0M3gaBIL5jibSgUawBoVuCKyhgeE')

# Load the FAQ data
faq_data = {
    "account": [
        {"question": "How do I reset my password?", "answer": "Click 'Forgot Password' on the login page."},
        {"question": "How do I create an account?", "answer": "Click 'Sign Up', fill in details, and verify email."}
    ],
    "orders": [
        {"question": "How can I track my order?", "answer": "Check 'My Orders' section after logging in."},
        {"question": "What happens if my order is delayed?", "answer": "We'll notify you via email/SMS."},
        {"question": "How do I modify or cancel my order?", "answer": "Modify or cancel within 5 minutes through 'My Orders'. After that, contact support."}
    ],
    "payment": [
        {"question": "What payment methods do you accept?", "answer": "Cards, UPI(like gpay, phonepay, amazon pay) and cash on delivery."},
        {"question": "How does cash on delivery work?", "answer": "Have the exact amount ready upon delivery."}
    ],
    "delivery": [
        {"question": "What are your delivery hours?", "answer": "We deliver from 10 AM to 10 PM daily."},
        {"question": "What is your delivery radius?", "answer": "We deliver within a 5-Kilometer radius of our café."}
    ],
    "customer_support": [
        {"question": "How can I contact customer support?", "answer": "Email us at support@example.com or call 1800-123-4567."},
        {"question": "What are your working hours?", "answer": "We're available from 9 AM to 5 PM, Monday to Friday."}
    ]
}

# Function to dynamically get relevant FAQs based on user input
def get_relevant_faqs(user_input, faq_data):
    relevant_faqs = []
    
    for category, faqs in faq_data.items():
        for faq in faqs:
            if any(keyword.lower() in user_input.lower() for keyword in faq['question'].split()):
                relevant_faqs.append(faq)
    
    return relevant_faqs

# Generate the prompt dynamically based on user input and relevant FAQ data
def generate_prompt(user_input, faq_data):
    relevant_faqs = get_relevant_faqs(user_input, faq_data)
    
    if not relevant_faqs:
        faq_text = "No relevant FAQs found. Please contact customer support."
    else:
        faq_text = "\n".join([f"- {faq['question']}: {faq['answer']}" for faq in relevant_faqs])

    prompt = f"""
    You are a helpful assistant for a café offering food delivery. Here are relevant FAQs:

    {faq_text}

    User question: {user_input}

    Respond naturally based on these FAQs. If the question isn't covered, kindly suggest contacting customer support.
    """
    
    return prompt

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_input = data.get('message', '')

        if not user_input:
            return jsonify({'error': 'No message provided'}), 400

        # Generate the prompt with the relevant FAQs
        prompt = generate_prompt(user_input, faq_data)
        print(prompt)
        # Call Gemini API to get the response
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(prompt)

        # Return the generated response
        return jsonify({
            'response': response.text,
            'success': True
        })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

if __name__ == '__main__':
    app.run(debug=True)