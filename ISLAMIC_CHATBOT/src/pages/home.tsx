import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleNavigate = () => {
    navigate('/chat'); // Navigate to chat page
  };

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
          }
          50% { 
            transform: translateY(-20px) rotate(5deg); 
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
            sans-serif;
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated floating leaves */}
        {!prefersReducedMotion && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <div className="animate-float" style={{
              position: 'absolute',
              top: '5rem',
              left: '2.5rem',
              fontSize: '2.25rem',
              opacity: 0.3,
              animationDelay: '0s'
            }}>🍃</div>
            <div className="animate-float" style={{
              position: 'absolute',
              top: '10rem',
              right: '5rem',
              fontSize: '1.875rem',
              opacity: 0.2,
              animationDelay: '2s'
            }}>🍃</div>
            <div className="animate-float" style={{
              position: 'absolute',
              bottom: '8rem',
              left: '25%',
              fontSize: '1.875rem',
              opacity: 0.25,
              animationDelay: '4s'
            }}>🍃</div>
          </div>
        )}

        <div className="fade-in" style={{
          maxWidth: '42rem',
          width: '100%',
          backgroundColor: 'rgba(104, 54, 196, 0.76)',
          backdropFilter: 'blur(12px)',
          borderRadius: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '3rem',
          position: 'relative',
          zIndex: 10
        }}>
          {/* Bismillah Section */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <p style={{
              fontSize: '1.875rem',
              fontFamily: 'serif',
              fontWeight: 600,
              color: '#f59e0b',
              marginBottom: '0.5rem',
              lineHeight: 1.5
            }} dir="rtl">
              بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
            </p>
            <p style={{
              fontSize: '0.875rem',
              color: '#10b981',
              fontStyle: 'italic',
              margin: 0
            }}>
              In the name of Allah, the Most Gracious, the Most Merciful
            </p>
          </div>

          {/* Hero Section */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '3.75rem', marginBottom: '1rem' }}>📖</div>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '1rem',
              lineHeight: 1.2
            }}>
              Quran & Hadith Explorer
            </h1>
            <p style={{
              fontSize: '1.125rem',
              color: '#059669',
              
              marginBottom: '1rem'
            }}>
              Discover the timeless wisdom of Islamic teachings
            </p>
            <p style={{
              fontSize: '0.875rem',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '1.25rem' }}>🌱</span>
              <span>Learning sustainably - Digital knowledge for a greener planet</span>
            </p>
          </div>

          {/* CTA Button */}
          <button 
            onClick={handleNavigate}
            type="button"
            style={{
              width: '100%',
              background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
              color: 'white',
              fontWeight: 600,
              fontSize: '1rem',
              padding: '1rem 2rem',
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.3s ease',
              transform: 'scale(1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to right, #25eb64ff, #3aabedff)';
              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to right, #25eb64ff,#3aabedff)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>🌿</span>
            <span>Let's Learn Quran & Hadith</span>
            <span style={{ fontSize: '1.25rem' }}>→</span>
          </button>

          {/* Eco Tips */}
          <div style={{
            marginTop: '2rem',
            fontSize: '0.75rem',
            textAlign: 'center',
            color: '#9ca3af'
          }}>
            <p style={{ margin: 0 }}>💡 Eco-tip: This page is optimized to use minimal energy</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;