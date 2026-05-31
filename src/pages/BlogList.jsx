import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../services/api';

const categories = ['All', 'Company News', 'Delivery Tips', 'Business Advice', 'Partner Spotlight'];

const BlogList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    API.get('/posts')
      .then(res => {
        if (res.data.success && res.data.data.length > 0) {
          // Filter to only show published posts in public view
          const published = res.data.data.filter(p => p.isPublished);
          setPosts(published);
        }
      })
      .catch(err => {
        console.log('Error fetching posts, using high-fidelity mock data fallback.', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter posts based on category and search query
  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getExcerpt = (htmlString) => {
    if (!htmlString) return '';
    const cleanString = htmlString.replace(/<\/?[^>]+(>|$)/g, " ");
    return cleanString.slice(0, 140) + (cleanString.length > 140 ? '...' : '');
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="blog-list-page" style={{ paddingTop: '100px', minHeight: '100vh', background: '#F8F9FD' }}>
      
      {/* Premium Header */}
      <div className="blog-header" style={{
        background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-dark) 100%)',
        color: '#fff',
        padding: '5rem 5% 4rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(244,123,0,0.15) 0%, transparent 70%)'
        }}></div>
        
        <div className="section-inner" style={{ position: 'relative', zIndex: 1 }}>
          <span className="section-tag" style={{ color: 'var(--orange)' }}>Insights & Updates</span>
          <h1 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Solvix Go <span style={{ color: 'var(--orange)' }}>Hub</span></h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', maxWidth: '600px', margin: '0 auto', fontSize: '1rem' }}>
            Discover professional delivery tips, company milestones, SME logistics advice, and partner spotlights in Gombe State.
          </p>
        </div>
      </div>

      {/* Main Section */}
      <section style={{ padding: '3rem 5%' }}>
        <div className="section-inner">
          
          {/* Filters & Search Bar */}
          <div className="blog-filters-bar" style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1.5rem',
            marginBottom: '3rem',
            flexWrap: 'wrap',
            background: '#fff',
            padding: '1.5rem 2rem',
            borderRadius: '16px',
            boxShadow: 'var(--card-shadow)'
          }}>
            {/* Category Pill Filters */}
            <div className="category-filters" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {categories.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCategoryChange(cat)}
                  style={{
                    padding: '0.5rem 1.25rem',
                    borderRadius: '50px',
                    border: '1px solid ' + (selectedCategory === cat ? 'var(--orange)' : '#E2E8F0'),
                    background: selectedCategory === cat ? 'var(--orange)' : 'transparent',
                    color: selectedCategory === cat ? '#fff' : 'var(--navy)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                  className="category-filter-btn"
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="search-box-wrap" style={{ position: 'relative', minWidth: '280px', flex: '1 0 max-content', maxWidth: '400px' }}>
              <input
                type="text"
                placeholder="Search articles, tags..."
                value={searchQuery}
                onChange={handleSearchChange}
                style={{
                  width: '100%',
                  padding: '0.75rem 1.5rem 0.75rem 2.75rem',
                  borderRadius: '50px',
                  border: '1.5px solid #E2E8F0',
                  fontSize: '0.875rem',
                  fontFamily: 'var(--font)',
                  outline: 'none',
                  color: 'var(--navy)'
                }}
              />
              <span style={{
                position: 'absolute',
                left: '1.2rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--gray-text)',
                pointerEvents: 'none'
              }}>🔍</span>
            </div>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '5rem 0' }}>
              <div className="spinner" style={{
                width: '40px',
                height: '40px',
                border: '4px solid rgba(13,27,77,0.1)',
                borderTopColor: 'var(--orange)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem'
              }}></div>
              <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
              `}</style>
              <p style={{ color: 'var(--navy)', fontWeight: 600 }}>Loading Hub posts...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '5rem 2rem',
              background: '#fff',
              borderRadius: '20px',
              boxShadow: 'var(--card-shadow)'
            }}>
              <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '1rem' }}>📭</span>
              <h3 style={{ color: 'var(--navy)', fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Articles Found</h3>
              <p style={{ color: 'var(--gray-text)', maxWidth: '450px', margin: '0 auto' }}>
                We couldn't find any articles matching your search criteria. Try selecting a different category or refining your search words.
              </p>
            </div>
          ) : (
            <div className="blog-posts-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '2rem'
            }}>
              {filteredPosts.map((post, idx) => (
                <motion.article
                  key={post._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="blog-card"
                  style={{
                    background: '#fff',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: 'var(--card-shadow)',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    border: '1px solid rgba(13, 27, 77, 0.05)',
                    transition: 'var(--transition)'
                  }}
                >
                  {/* Card Image */}
                  <div className="blog-card-img" style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                    <span style={{
                      position: 'absolute',
                      top: '1rem',
                      left: '1rem',
                      background: 'var(--navy)',
                      color: '#fff',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.35rem 0.85rem',
                      borderRadius: '50px',
                      textTransform: 'uppercase',
                      zIndex: 1
                    }}>
                      {post.category}
                    </span>
                    <img
                      src={post.coverImage?.url || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600'}
                      alt={post.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease'
                      }}
                      className="blog-img"
                    />
                  </div>

                  {/* Card Body */}
                  <div className="blog-card-body" style={{ padding: '1.5rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <span style={{ color: 'var(--gray-text)', fontSize: '0.78rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>
                      📅 {formatDate(post.publishedAt || post.createdAt)}
                    </span>
                    <h3 style={{
                      color: 'var(--navy)',
                      fontSize: '1.15rem',
                      fontWeight: 800,
                      lineHeight: 1.3,
                      marginBottom: '0.75rem',
                      cursor: 'pointer'
                    }}>
                      <Link to={`/blog/${post.slug}`} className="hover-link" style={{ transition: 'color 0.2s ease' }}>
                        {post.title}
                      </Link>
                    </h3>
                    <p style={{ color: 'var(--gray-text)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                      {getExcerpt(post.body)}
                    </p>

                    {/* Footer link */}
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Link to={`/blog/${post.slug}`} style={{
                        color: 'var(--orange)',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }} className="read-more-btn">
                        Read Article <span style={{ transition: 'transform 0.2s ease' }}>→</span>
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* In-page animations stylesheet */}
      <style dangerouslySetInnerHTML={{__html: `
        .blog-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 36px rgba(13, 27, 77, 0.15) !important;
        }
        .blog-card:hover .blog-img {
          transform: scale(1.05);
        }
        .hover-link:hover {
          color: var(--orange) !important;
        }
        .read-more-btn:hover span {
          transform: translateX(4px);
        }
      `}} />
    </div>
  );
};

export default BlogList;
