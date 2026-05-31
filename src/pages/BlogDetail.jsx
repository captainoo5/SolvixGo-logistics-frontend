import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../services/api';

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentPosts, setRecentPosts] = useState([]);

  useEffect(() => {
    setLoading(true);
    // Fetch individual post by slug
    API.get(`/posts/${slug}`)
      .then(res => {
        if (res.data.success && res.data.data) {
          setPost(res.data.data);
        }
      })
      .catch(err => {
        console.log('API Single post load failed.', err);
      })
      .finally(() => {
        setLoading(false);
      });

    // Fetch lists for recent posts sidebar
    API.get('/posts')
      .then(res => {
        if (res.data.success && res.data.data.length > 0) {
          const published = res.data.data.filter(p => p.isPublished && p.slug !== slug).slice(0, 3);
          setRecentPosts(published);
        }
      })
      .catch((err) => {
        console.log('API Recent posts load failed.', err);
      });

    // Scroll to top on slug transition
    window.scrollTo(0, 0);
  }, [slug]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <div style={{ padding: '150px 5% 100px', textAlign: 'center', minHeight: '80vh', background: '#F8F9FD' }}>
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
        <p style={{ color: 'var(--navy)', fontWeight: 600 }}>Loading article contents...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ padding: '150px 5% 100px', textAlign: 'center', minHeight: '80vh', background: '#F8F9FD' }}>
        <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1.5rem' }}>🔍</span>
        <h2 style={{ color: 'var(--navy)', fontWeight: 800, marginBottom: '1rem' }}>Article Not Found</h2>
        <p style={{ color: 'var(--gray-text)', marginBottom: '2rem' }}>We apologize, but the article you are looking for does not exist or has been removed.</p>
        <button onClick={() => navigate('/blog')} className="btn btn-orange">Back to Blog Hub</button>
      </div>
    );
  }

  return (
    <div className="blog-detail-page" style={{ paddingTop: '72px', minHeight: '100vh', background: '#F8F9FD' }}>
      
      {/* Article Cover Hero */}
      <div className="article-hero" style={{
        position: 'relative',
        height: '450px',
        overflow: 'hidden',
        background: 'var(--navy)'
      }}>
        {/* Shadow Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(13, 27, 77, 0.4) 0%, rgba(13, 27, 77, 0.9) 100%)',
          zIndex: 1
        }}></div>

        <img
          src={post.coverImage?.url || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200'}
          alt={post.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Hero Meta (Overlay) */}
        <div className="section-inner" style={{
          position: 'absolute',
          bottom: '0',
          left: '5%',
          right: '5%',
          zIndex: 2,
          paddingBottom: '3rem',
          color: '#fff'
        }}>
          {/* Breadcrumb & Category */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <Link to="/blog" style={{ color: 'var(--orange)', fontWeight: 700, fontSize: '0.85rem' }}>Blog Hub</Link>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>/</span>
            <span style={{
              background: 'var(--orange)',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.25rem 0.75rem',
              borderRadius: '50px',
              textTransform: 'uppercase'
            }}>
              {post.category}
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            color: '#fff',
            fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)',
            fontWeight: 800,
            lineHeight: 1.2,
            maxWidth: '900px',
            marginBottom: '1.25rem'
          }}>
            {post.title}
          </h1>

          {/* Date & Info */}
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', flexWrap: 'wrap' }}>
            <span>📅 Published on {formatDate(post.publishedAt || post.createdAt)}</span>
            <span>⏱️ 3 Min Read</span>
          </div>
        </div>
      </div>

      {/* Main Layout Container */}
      <section style={{ padding: '4rem 5%' }}>
        <div className="section-inner" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 320px',
          gap: '3.5rem'
        }} className="detail-layout">
          
          {/* Article Main Body */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              background: '#fff',
              padding: '3rem 2.5rem',
              borderRadius: '20px',
              boxShadow: 'var(--card-shadow)'
            }}
            className="article-content-wrapper"
          >
            {/* Rich Text Output */}
            <div 
              className="rich-text-content"
              dangerouslySetInnerHTML={{ __html: post.body }}
              style={{
                color: 'var(--dark-text)',
                fontSize: '1.05rem',
                lineHeight: 1.85,
                fontFamily: 'var(--font)'
              }}
            />

            {/* Tags footer */}
            {post.tags && post.tags.length > 0 && (
              <div style={{
                marginTop: '3rem',
                paddingTop: '2rem',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <span style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '0.85rem' }}>Tags:</span>
                {post.tags.map((tag, idx) => (
                  <span key={idx} style={{
                    background: '#F1F5F9',
                    color: 'var(--navy)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.3rem 0.8rem',
                    borderRadius: '50px'
                  }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* CTA Return */}
            <div style={{ marginTop: '3rem', textAlign: 'left' }}>
              <Link to="/blog" className="btn btn-orange" style={{ padding: '0.75rem 1.5rem' }}>
                ← Back to Blog Hub
              </Link>
            </div>
          </motion.div>

          {/* Sidebar */}
          <div className="detail-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            {/* Delivery CTA Box */}
            <div style={{
              background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-dark) 100%)',
              color: '#fff',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: 'var(--card-shadow)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.75rem' }}>
                Need Dispatch in Gombe?
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Outsource your logistics today. Get same-day, secure delivery by Gombe's premium logistics partner.
              </p>
              <a
                href="https://wa.me/2348128830983?text=Hello%20Solvix%20Go%2C%20I%20want%20to%20place%20an%20order!"
                target="_blank"
                rel="noreferrer"
                className="btn btn-orange"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Place Order Now
              </a>
            </div>

            {/* Recent Posts List */}
            <div style={{
              background: '#fff',
              padding: '2rem',
              borderRadius: '20px',
              boxShadow: 'var(--card-shadow)'
            }}>
              <h4 style={{
                color: 'var(--navy)',
                fontSize: '1.1rem',
                fontWeight: 800,
                borderBottom: '2.5px solid var(--orange)',
                paddingBottom: '0.5rem',
                marginBottom: '1.25rem'
              }}>
                Recent Articles
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {recentPosts.map((rPost) => (
                  <div key={rPost._id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <img 
                      src={rPost.coverImage?.url || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=100'} 
                      alt="" 
                      style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div>
                      <h5 style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        lineHeight: 1.3,
                        color: 'var(--navy)',
                        margin: 0
                      }}>
                        <Link to={`/blog/${rPost.slug}`} className="hover-link" style={{ transition: 'var(--transition)' }}>
                          {rPost.title}
                        </Link>
                      </h5>
                      <span style={{ fontSize: '0.75rem', color: 'var(--gray-text)', marginTop: '0.2rem', display: 'block' }}>
                        {formatDate(rPost.publishedAt || rPost.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Embedded styles for detail pages */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 991px) {
          .detail-layout {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }
        }
        .rich-text-content p {
          margin-bottom: 1.5rem !important;
        }
        .rich-text-content h3 {
          font-size: 1.4rem !important;
          font-weight: 800 !important;
          color: var(--navy) !important;
          margin: 2rem 0 1rem !important;
        }
        .rich-text-content ul, .rich-text-content ol {
          margin-bottom: 1.5rem !important;
          padding-left: 1.5rem !important;
        }
        .rich-text-content li {
          margin-bottom: 0.5rem !important;
        }
        .hover-link:hover {
          color: var(--orange) !important;
        }
      `}} />
    </div>
  );
};

export default BlogDetail;
