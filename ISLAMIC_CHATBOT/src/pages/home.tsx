import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

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

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🕌</div>
            <h3>Explore the Quran</h3>
            <p>Search through verses and understand their meanings</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📜</div>
            <h3>Study Hadith</h3>
            <p>Discover the teachings and sayings of Prophet Muhammad (ﷺ)</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Smart Search</h3>
            <p>Find relevant verses and hadiths by topic or keyword</p>
          </div>
          
          <div className="feature-card eco-card">
            <div className="feature-icon">🌍</div>
            <h3>Eco-Friendly Learning</h3>
            <p>Paperless knowledge sharing for a sustainable future</p>
          </div>
        </div>

        <button 
          className="cta-button"
          onClick={() => navigate('/chat')}
        >
          <span className="button-icon">🌿</span>
          Let's Learn Quran & Hadith
          <span className="button-arrow">→</span>
        </button>

        <div className="environmental-impact">
          <p className="impact-title">🌱 Our Green Commitment</p>
          <p className="impact-text">
            By choosing digital learning, you're helping save paper and reduce carbon footprint. 
            Every search here is a step towards sustainable knowledge sharing.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;