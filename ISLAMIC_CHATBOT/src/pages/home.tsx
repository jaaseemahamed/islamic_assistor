
import { useNavigate } from 'react-router-dom';
import './Home.css';


const Home = () => {
  const navigate = useNavigate();

  // Handle navigation to chatbot
  const handleNavigate = () => {
    console.log('Button clicked - navigating to /chat');
    navigate('/chat');
  };

  return (
    <div className="home-container">
      <div className="nature-background">
        <div className="floating-leaf leaf-1">🍃</div>
        <div className="floating-leaf leaf-2">🍃</div>
        <div className="floating-leaf leaf-3">🍃</div>
      </div>

      <div className="home-content">
        <div className="bismillah-section">
          <p className="bismillah-arabic-home">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
          <p className="bismillah-english-home">In the name of Allah, the Most Gracious, the Most Merciful</p>
        </div>

        <div className="hero-section">
          <div className="book-icon">📖</div>
          <h1 className="main-title">
            Quran & Hadith Explorer
          </h1>
          <p className="subtitle">
            Discover the timeless wisdom of Islamic teachings
          </p>
          <p className="eco-message">
            🌱 Learning sustainably - Digital knowledge for a greener planet
          </p>
        </div>

        <button 
          className="cta-button"
          onClick={handleNavigate}
          type="button"
        >
          <span className="button-icon">🌿</span>
          Let's Learn Quran & Hadith
          <span className="button-arrow">→</span>
        </button>
      </div>
    </div>
  );
};

export default Home;