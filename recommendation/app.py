from flask import Flask, request, jsonify
from flask_cors import CORS
from surprise import Dataset, Reader, SVD
from surprise.model_selection import train_test_split
import pandas as pd
import numpy as np
from pymongo import MongoClient
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# Initialize MongoDB connection
client = MongoClient("mongodb+srv://CafeCrush:12345@cluster0.qiu3t.mongodb.net/food-del")
db = client['food-del']

# Initialize the SVD algorithm
algo = SVD()

def prepare_data():
    try:
        # Fetch orders from MongoDB
        orders = list(db.orders.find({}, {
            'userId': 1,
            'items': 1,
            '_id': 0
        }))
        
        # Transform orders into ratings format
        ratings_data = []
        for order in orders:
            user_id = order['userId']
            for item in order['items']:
                # Use quantity as an implicit rating (1-5 scale)
                rating = min(5, item['quantity'])  # Cap rating at 5
                ratings_data.append({
                    'user': user_id,
                    'item': item['_id'],
                    'rating': rating
                })
        
        if not ratings_data:
            print("No ratings data found")
            return
        
        # Convert to DataFrame
        df = pd.DataFrame(ratings_data)
        
        # Create the reader object
        reader = Reader(rating_scale=(1, 5))
        
        # Create the dataset
        data = Dataset.load_from_df(df[["user", "item", "rating"]], reader)
        
        # Train the algorithm
        trainset = data.build_full_trainset()
        algo.fit(trainset)
        
    except Exception as e:
        print(f"Error preparing data: {e}")

# Train the model when the app starts
prepare_data()

@app.route('/recommend', methods=['POST'])
def get_recommendations():
    try:
        user_id = request.json.get('userId')
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400

        # Get all available food items from the database
        food_items = list(db.foods.find({}, {'_id': 1}))
        all_items = [str(item['_id']) for item in food_items]
        
        if not all_items:
            return jsonify({
                "success": False,
                "error": "No food items found in database"
            }), 404
        
        # Predict ratings for all items
        predictions = []
        for item_id in all_items:
            try:
                pred = algo.predict(user_id, item_id)
                predictions.append((item_id, pred.est))
            except Exception as e:
                # If prediction fails for an item, skip it
                continue
        
        # Sort predictions by estimated rating
        predictions.sort(key=lambda x: x[1], reverse=True)
        
        # Get top 10 recommendations
        top_recommendations = [{"itemId": p[0], "score": float(p[1])} for p in predictions[:10]]
        
        return jsonify({
            "success": True,
            "recommendations": top_recommendations
        })

    except Exception as e:
        print(f"Error generating recommendations: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    app.run(port=5000)