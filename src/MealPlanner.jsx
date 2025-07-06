import React, { useState, useReducer, useRef } from 'react';
import './MealPlanner.css';

const API_BASE = 'http://127.0.0.1:5000';
const BUTTON_SOUND_URL = "/button.mp3";

export default function MealPlanner() {
  const [mealPlan, setMealPlan] = useState(null);
  const [groceryList, setGroceryList] = useState(null);
  const [costBreakdown, setCostBreakdown] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rawResponse, setRawResponse] = useState(null);
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const audioRef = useRef(null);

  React.useEffect(() => {
    audioRef.current = new window.Audio(BUTTON_SOUND_URL);
  }, []);

  const playButtonSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  const handleGenerateMealPlan = async () => {
    playButtonSound();
    setLoading(true);
    setError('');
    setMealPlan(null);
    setGroceryList(null);
    setCostBreakdown(null);
    setRawResponse(null);
    try {
      const res = await fetch(`${API_BASE}/generate-meal-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      setRawResponse(data);
      console.log('Meal plan API response:', data);
      if (data && typeof data.meal_plan === 'object' && data.meal_plan !== null) {
        setMealPlan(data.meal_plan);
      } else {
        setError('Meal plan data is not in the expected format.');
      }
      forceUpdate();
    } catch (err) {
      setError('Failed to generate meal plan.');
      forceUpdate();
    }
    setLoading(false);
  };

  const handleGenerateGroceryList = async () => {
    if (!mealPlan) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/grocery-list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meal_plan: mealPlan })
      });
      const data = await res.json();
      setGroceryList(data.grocery_list);
      setCostBreakdown(data.cost_breakdown);
    } catch (err) {
      setError('Failed to generate grocery list.');
    }
    setLoading(false);
  };

  return (
    <div className="meal-planner-container">
      <h1 className="rainbow-title animated-title">Flan Meal Planner</h1>
      <div className="flan-img-container">
        {/* Cartoon flan SVG with gentle bounce animation */}
        <svg className="flan-bounce" width="100" height="90" viewBox="0 0 100 90" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="50" cy="80" rx="38" ry="10" fill="#e0b96a"/>
          <ellipse cx="50" cy="60" rx="30" ry="18" fill="#f7e1a0"/>
          <ellipse cx="50" cy="50" rx="28" ry="14" fill="#f9d77e"/>
          <ellipse cx="50" cy="40" rx="26" ry="12" fill="#fbe8b0"/>
          <ellipse cx="50" cy="30" rx="24" ry="10" fill="#fff3d1"/>
          <ellipse cx="50" cy="20" rx="22" ry="8" fill="#f7e1a0"/>
          <ellipse cx="50" cy="12" rx="20" ry="6" fill="#c97c3a"/>
          {/* Flan face */}
          <ellipse cx="40" cy="35" rx="2.5" ry="3" fill="#6b3e26"/>
          <ellipse cx="60" cy="35" rx="2.5" ry="3" fill="#6b3e26"/>
          <ellipse cx="50" cy="44" rx="5" ry="3" fill="#fff"/>
          <ellipse cx="50" cy="45" rx="3.5" ry="1.5" fill="#f9b384"/>
          <ellipse cx="50" cy="43.5" rx="2.5" ry="1" fill="#fff3d1"/>
        </svg>
      </div>
      <button className="main-btn" onClick={handleGenerateMealPlan} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Meal Plan'}
      </button>
      {error && <div className="error">{error}</div>}
      {mealPlan && (
        <div className="meal-plan-section">
          <h2>Meal Plan <span className="meal-plan-emojis" role="img" aria-label="meal emojis">🍔</span></h2>
          <div className="meal-plan-list">
            {Object.entries(mealPlan).map(([day, meals]) => {
              const isFlanDay = meals.Lunch.includes('Flan Burger') || meals.Dinner.includes('Flan Burger');
              return (
                <div className="day-card" key={day}>
                  <h3>
                    {day} {isFlanDay && <span className="flan-day-subtitle">(National Flan Day)</span>}
                  </h3>
                  <ul>
                    <li><strong>Breakfast:</strong> {meals.Breakfast}</li>
                    <li><strong>Lunch:</strong> {meals.Lunch.includes('Flan Burger') ? <span className="flan-burger-highlight">{meals.Lunch}</span> : meals.Lunch}</li>
                    <li><strong>Dinner:</strong> {meals.Dinner.includes('Flan Burger') ? <span className="flan-burger-highlight">{meals.Dinner}</span> : meals.Dinner}</li>
                    <li><strong>Shhhhnack:</strong> {meals.Snacks}</li>
                  </ul>
                </div>
              );
            })}
          </div>
          <button className="main-btn" onClick={handleGenerateGroceryList} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Grocery List & Cost'}
          </button>
        </div>
      )}
      {groceryList && (
        <div className="grocery-section">
          <h2>Grocery List</h2>
          <ul className="grocery-list">
            {groceryList.map((item, idx) => (
              <li key={idx}>
                {item.item} — {item.qty} {item.unit}
              </li>
            ))}
          </ul>
          <h3>Estimated Cost</h3>
          <ul className="cost-list">
            {Object.entries(costBreakdown).map(([store, cost]) => (
              <li key={store}><strong>{store}:</strong> ${cost.toFixed(2)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 