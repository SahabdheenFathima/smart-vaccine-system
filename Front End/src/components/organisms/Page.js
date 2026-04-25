import '../../globals.css';
import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import stage1 from '../../assets/images/stage1.jpg';
import stage2 from '../../assets/images/stage2.jpg';
import stage3 from '../../assets/images/stage3.jpg';
import stage4 from '../../assets/images/stage4.jpg';
import stage5 from '../../assets/images/stage5.jpg';
import stage6 from '../../assets/images/stage6.jpg';
import stage7 from '../../assets/images/stage7.jpg';
import stage8 from '../../assets/images/stage8.jpg';
import stage9 from '../../assets/images/stage9.jpg';

const stages = [
  { age: '6 Weeks - 3 Months', image: stage1, description: '1. Raises head when lying down.\n2. Follows moving objects from one place to another with eyes.\n3. Changes behavior in response to loud noises.\n4. Makes sounds like aaa oo ee when stimulated.\n5. Smiles when seeing mother (social smile).' },
  { age: '3 Months - 6 Months', image: stage2, description: '1. Raising the head and chest while lying on the back.\n2. Interlacing the fingers and playing with the hands.\n3. Grasping objects.\n4. Turning the head towards sound.\n5. Pronouncing letters like ba.\n6. Smiling.' },
  { age: '6 Months - 9 Months', image: stage3, description: '1. Raising the head when lying on the back.\n2. Rolling the body from the back to the stomach\n3. Transferring objects from one hand to the other.\n4. Making sounds like Tata, Rara, Lala, Baba.' },
  { age: '9 Months - 12 Months', image: stage4, description: '1. Standing without assistance.\n2. Standing up with assistance.\n3. Repeating sounds.\n4. Producing meaningful sounds.\n5. Articulating a few words\n6. Giving small, simple instructions.' },
  { age: '12 Months - 18 Months', image: stage5, description: '1. Walks with assistance.\n2. Says at least 2-3 verbs.\n3. Points to familiar objects when asked.\n4. Rolls a small ball.\n5. Recognizes at least one body part.\n6. Picking up small objects with thumb and index fingers.' },
  { age: '18 Months - 2 Years', image: stage6, description: '1. Walking without help.\n2. Climbing stairs with help.\n3. Building a pillar with 2-3 fingers.\n4. Eating food by himself.\n5. Saying 10 words, using at least one or two phrases.\n6. Kissing and puckering the lips.' },
  { age: '2 Years - 3 Years', image: stage7, description: '1. Running without falling.\n2. Going up and down stairs without falling.\n3. Drawing circles, straight lines, etc. by looking at them.\n4. Using sentences of more than 3 words.' },
  { age: '3 Years - 4 Years', image: stage8, description: '1. Standing on one leg.\n2. Jumping down a step.\n3. Wearing clothes, putting on shoes.\n4. Looking at circles and patterns.\n5. Counting to 3.\n6. Using complete, complex sentences.' },
  { age: '4 Years - 5 Years', image: stage9, description: '1. Hopping on one leg.\n2. Automatic dressing.\n3. Self-feeding with a spoon.\n4. Drawing simple human figures.\n5. Playing with children of the same age.\n6. Correct mention of name and age.' },
];

function Page() {
   const [checkedItems, setCheckedItems] = useState(() => {
    const stored = localStorage.getItem('checkedItems');
    return stored ? JSON.parse(stored) : {};
  });

  useEffect(() => {
    localStorage.setItem('checkedItems', JSON.stringify(checkedItems));
  }, [checkedItems]);

  const handleCheckboxChange = (stageIndex, itemIndex) => {
    setCheckedItems((prev) => {
      const updated = { ...prev, [`${stageIndex}-${itemIndex}`]: !prev[`${stageIndex}-${itemIndex}`] };
      return updated;
    });
  };
  return (
    <div className="stages-container">
      <h1 className="title">🧒 Developmental Stages from Birth to 5 Years</h1>
      <div className="stage-grid">
        {stages.map((stage, index) => (
          <div key={index} className="stage-card">
            <h2>{stage.age}</h2>
            <img src={stage.image} alt={stage.age} className="stage-image" />
            <details className="stage-description">
              <summary>Activities</summary>
               {stage.description.split('\n').map((desc, i) => (
                <div key={i} className="checkbox-item">
                  <label htmlFor={`checkbox-${index}-${i}`} style={{ marginRight: '12px' }}>{desc}</label>
                  <input
                    type="checkbox"
                    id={`checkbox-${index}-${i}`}
                    checked={!!checkedItems[`${index}-${i}`]}
                    onChange={() => handleCheckboxChange(index, i)}
                  />
                </div>
              ))}
            </details>
          </div>
        ))}
        <Link to="/Form">
          <button className="next-button">Next</button>
        </Link>
      </div>
    </div>
  );
}

export default Page;

