import React, { useState, useEffect, useRef } from 'react';
import nlpService from '../services/nlpservice';
import type { Message, SearchResult } from '../types';
import { isQuranVerse } from '../types';
import './quranbot.css';

const QuranBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<SearchResult[]>([]);
  const [showBookmarks, setShowBookmarks] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    source: 'both' as 'quran' | 'hadith' | 'both',
    maxResults: 10
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeService = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await nlpService.loadData();
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setError((error as Error).message);
        setIsLoading(false);
      }
    };
    
    initializeService();
  }, []);

 const scrollToBottom = () => {
  if (messagesEndRef.current) {
    const container = messagesEndRef.current.closest('.messages-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }
};

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const copyToClipboard = async (text: string, uniqueId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(uniqueId);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const toggleBookmark = (result: SearchResult) => {
    const resultString = JSON.stringify(result);
    const exists = bookmarks.some(b => JSON.stringify(b) === resultString);
    
    if (exists) {
      setBookmarks(prev => prev.filter(b => JSON.stringify(b) !== resultString));
    } else {
      setBookmarks(prev => [...prev, result]);
    }
  };

  const isBookmarked = (result: SearchResult): boolean => {
    const resultString = JSON.stringify(result);
    return bookmarks.some(b => JSON.stringify(b) === resultString);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleUserInput = async (retryCount = 0) => {
    if (!input.trim() || isProcessing) return;

    setIsProcessing(true);
    const userMessage: Message = { text: input, sender: 'user', timestamp: new Date() };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    const currentInput = input;
    setInput('');

    try {
      const searchResults = await nlpService.processQuery(currentInput);

      let botResponse: Message;
      if (searchResults && searchResults.length > 0) {
        const filteredResults = filters.source === 'both' 
          ? searchResults 
          : searchResults.filter(r => 
              filters.source === 'quran' ? isQuranVerse(r) : !isQuranVerse(r)
            );

        botResponse = {
          sender: 'bot',
          timestamp: new Date(),
          results: filteredResults.slice(0, filters.maxResults)
        };
      } else {
        const suggestions = nlpService.getSuggestions();
        botResponse = {
          text: "I couldn't find any relevant information matching your query.",
          sender: 'bot',
          timestamp: new Date(),
          isError: true,
          suggestions
        };
      }

      setMessages(prevMessages => [...prevMessages, botResponse]);
    } catch (error) {
      console.error('Error processing query:', error);
      
      if (retryCount < 2) {
        setTimeout(() => {
          setIsProcessing(false);
          handleUserInput(retryCount + 1);
        }, 1000);
        return;
      }

      const errorResponse: Message = {
        text: "I apologize, but I encountered an error while processing your query. Please try again.",
        sender: 'bot',
        timestamp: new Date(),
        isError: true,
        suggestions: nlpService.getSuggestions()
      };
      setMessages(prevMessages => [...prevMessages, errorResponse]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleUserInput();
    }
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="spinner"></div>
          <p className="loading-text">Loading Islamic Database...</p>
          <p className="loading-subtext">Preparing Quran and Hadith collections</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <div className="error-content">
          <div className="error-icon">⚠️</div>
          <h2 className="error-title">Error Loading Data</h2>
          <p className="error-message">{error}</p>
          <button 
            className="retry-button" 
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-content">
          <div className="bismillah-container">
            <p className="bismillah-arabic">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
            <p className="bismillah-english">In the name of Allah, the Most Gracious, the Most Merciful</p>
          </div>
          <div className="header-title-wrapper">
            <span className="header-icon">📖</span>
            <h1 className="header-title">Quran & Hadith Explorer</h1>
          </div>
          <p className="header-subtitle">Ask questions about Islamic teachings</p>
          
          <div className="header-controls">
            <div className="filter-controls">
              <label className="filter-label">
                Source:
                <select 
                  value={filters.source} 
                  onChange={(e) => setFilters({...filters, source: e.target.value as any})}
                  className="filter-select"
                >
                  <option value="both">Both</option>
                  <option value="quran">Quran Only</option>
                  <option value="hadith">Hadith Only</option>
                </select>
              </label>
              <label className="filter-label">
                Max Results:
                <select 
                  value={filters.maxResults} 
                  onChange={(e) => setFilters({...filters, maxResults: parseInt(e.target.value)})}
                  className="filter-select"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="15">15</option>
                </select>
              </label>
            </div>
            <button 
              className="bookmark-toggle-btn"
              onClick={() => setShowBookmarks(!showBookmarks)}
            >
              🔖 Bookmarks ({bookmarks.length})
            </button>
          </div>
        </div>
      </div>

      <div className="messages-container">
        <div className="messages-wrapper">
          {showBookmarks ? (
            <div className="bookmarks-view">
              <div className="bookmarks-header">
                <h2>📚 Your Bookmarks</h2>
                <button onClick={() => setShowBookmarks(false)}>← Back to Chat</button>
              </div>
              {bookmarks.length === 0 ? (
                <p className="empty-bookmarks">No bookmarks yet. Start bookmarking verses and hadiths!</p>
              ) : (
                <div className="results-container">
                  {bookmarks.map((result, idx) => (
                    <div key={idx} className="result-card">
                      {isQuranVerse(result) ? (
                        <div className="quran-result">
                          <div className="result-header quran-header">
                            <div className="header-info">
                              <span className="result-icon">📖</span>
                              <span className="result-title">
                                Quran - Surah {result.Surah}, Verse {result.Verse}
                              </span>
                            </div>
                            <div className="action-buttons">
                              <button
                                onClick={() => copyToClipboard(`${result.English}\n\n${result.Arabic}`, `bm-${idx}`)}
                                className="copy-button"
                                title="Copy to clipboard"
                              >
                                {copiedIndex === `bm-${idx}` ? '✓' : '📋'}
                              </button>
                              <button
                                onClick={() => toggleBookmark(result)}
                                className="bookmark-button bookmarked"
                                title="Remove bookmark"
                              >
                                🔖
                              </button>
                            </div>
                          </div>
                          <div className="result-body">
                            <div className="translation-section">
                              <p className="section-label">English Translation</p>
                              <p className="translation-text">{result.English}</p>
                            </div>
                            <div className="arabic-section">
                              <p className="section-label">Arabic Text</p>
                              <p className="arabic-text">{result.Arabic}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="hadith-result">
                          <div className="result-header hadith-header">
                            <div className="header-info">
                              <span className="result-icon">💬</span>
                              <span className="result-title">
                                {result.book} - {result.number}
                              </span>
                            </div>
                            <div className="action-buttons">
                              <button
                                onClick={() => copyToClipboard(result.english, `bm-${idx}`)}
                                className="copy-button"
                                title="Copy to clipboard"
                              >
                                {copiedIndex === `bm-${idx}` ? '✓' : '📋'}
                              </button>
                              <button
                                onClick={() => toggleBookmark(result)}
                                className="bookmark-button bookmarked"
                                title="Remove bookmark"
                              >
                                🔖
                              </button>
                            </div>
                          </div>
                          <div className="result-body">
                            <p className="hadith-text">{result.english}</p>
                            {result.category && (
                              <p className="hadith-category">Category: {result.category}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {messages.length === 0 && (
                <div className="empty-state">
                  <p className="empty-message">Start your journey of learning</p>
                  <p className="empty-hint">Try these searches:</p>
                  <div className="suggestion-chips">
                    {nlpService.getSuggestions().slice(0, 4).map((suggestion, idx) => (
                      <button 
                        key={idx}
                        className="suggestion-chip"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {messages.map((message, index) => (
                <div key={index} className={`message-row ${message.sender}`}>
                  {message.sender === 'user' ? (
                    <div className="user-message">
                      <p>{message.text}</p>
                    </div>
                  ) : message.isError ? (
                    <div className="error-message-card">
                      <div className="error-header">
                        <span className="error-icon-small">⚠️</span>
                        <p className="error-text">{message.text}</p>
                      </div>
                        {message.suggestions && (
                          <div className="error-suggestions">
                            <p className="suggestions-title">Try these instead:</p>
                            <div className="suggestion-chips">
                              {message.suggestions.slice(0, 4).map((suggestion: string, idx: number) => (
                                <button 
                                  key={idx}
                                  className="suggestion-chip"
                                  onClick={() => handleSuggestionClick(suggestion)}
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  ) : (
                    <div className="results-container">
                      {message.results?.map((result, resultIndex) => (
                        <div key={resultIndex} className="result-card">
                          {isQuranVerse(result) ? (
                            <div className="quran-result">
                              <div className="result-header quran-header">
                                <div className="header-info">
                                  <span className="result-icon">📖</span>
                                  <span className="result-title">
                                    Quran - Surah {result.Surah}, Verse {result.Verse}
                                  </span>
                                </div>
                                <div className="action-buttons">
                                  <button
                                    onClick={() => copyToClipboard(`${result.English}\n\n${result.Arabic}`, `${index}-${resultIndex}`)}
                                    className="copy-button"
                                    title="Copy to clipboard"
                                  >
                                    {copiedIndex === `${index}-${resultIndex}` ? '✓' : '📋'}
                                  </button>
                                  <button
                                    onClick={() => toggleBookmark(result)}
                                    className={`bookmark-button ${isBookmarked(result) ? 'bookmarked' : ''}`}
                                    title={isBookmarked(result) ? 'Remove bookmark' : 'Add bookmark'}
                                  >
                                    🔖
                                  </button>
                                </div>
                              </div>
                              <div className="result-body">
                                <div className="translation-section">
                                  <p className="section-label">English Translation</p>
                                  <p className="translation-text">{result.English}</p>
                                </div>
                                <div className="arabic-section">
                                  <p className="section-label">Arabic Text</p>
                                  <p className="arabic-text">{result.Arabic}</p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="hadith-result">
                              <div className="result-header hadith-header">
                                <div className="header-info">
                                  <span className="result-icon">💬</span>
                                  <span className="result-title">
                                    {result.book} - {result.number}
                                  </span>
                                </div>
                                <div className="action-buttons">
                                  <button
                                    onClick={() => copyToClipboard(result.english, `${index}-${resultIndex}`)}
                                    className="copy-button"
                                    title="Copy to clipboard"
                                  >
                                    {copiedIndex === `${index}-${resultIndex}` ? '✓' : '📋'}
                                  </button>
                                  <button
                                    onClick={() => toggleBookmark(result)}
                                    className={`bookmark-button ${isBookmarked(result) ? 'bookmarked' : ''}`}
                                    title={isBookmarked(result) ? 'Remove bookmark' : 'Add bookmark'}
                                  >
                                    🔖
                                  </button>
                                </div>
                              </div>
                              <div className="result-body">
                                <p className="hadith-text">{result.english}</p>
                                {result.category && (
                                  <p className="hadith-category">Category: {result.category}</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {isProcessing && (
                <div className="message-row bot">
                  <div className="processing-message">
                    <div className="spinner-small"></div>
                    <span>Searching...</span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      <div className="input-container">
        <div className="input-wrapper">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about Quran verses or Hadiths... (e.g., 'prayer', 'Surah 2:255')"
            disabled={isProcessing || showBookmarks}
            className="chat-input"
          />
          <button
            onClick={() => handleUserInput()}
            disabled={isProcessing || !input.trim() || showBookmarks}
            className="send-button"
          >
            {isProcessing ? (
              <>
                <span className="spinner-small"></span>
                Searching...
              </>
            ) : (
              <>
                <span className="search-icon-btn">🔍</span>
                Search
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuranBot;