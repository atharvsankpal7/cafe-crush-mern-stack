import React, { useContext, useEffect, useState } from 'react'
import './FoodDisplay.css'
import FoodItem from '../FoodItem/FoodItem'
import { StoreContext } from '../../Context/StoreContext'
import axios from 'axios'

const FoodDisplay = ({category, title = "Top dishes near you"}) => {
  const {food_list, token} = useContext(StoreContext);
  const [recommendedItems, setRecommendedItems] = useState([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (token && title === "Recommended for you") {
        try {
          const response = await axios.post('http://localhost:5000/recommend', {
            userId: token
          });
          
          if (response.data.success) {
            const recommendedIds = response.data.recommendations.map(rec => rec.itemId.toString());
            const recommendedFoods = food_list.filter(item => 
              recommendedIds.includes(item._id)
            );
            setRecommendedItems(recommendedFoods);
          }
        } catch (error) {
          console.error('Error fetching recommendations:', error);
          setRecommendedItems(food_list);
        }
      }
    };

    fetchRecommendations();
  }, [token, food_list, title]);

  const displayItems = title === "Recommended for you" ? recommendedItems : food_list;

  return (
    <div className='food-display' id='food-display'>
      <h2>{title}</h2>
      <div className='food-display-list'>
        {displayItems.map((item) => {
          if (category === "All" || category === item.category) {
            return <FoodItem key={item._id} image={item.image} name={item.name} desc={item.description} price={item.price} id={item._id}/>
          }
          return null;
        })}
      </div>
    </div>
  )
}

export default FoodDisplay