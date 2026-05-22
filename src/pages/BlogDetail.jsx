import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../services/api';

const mockPosts = [
  {
    _id: 'post-1',
    title: 'Why Solvix Go is Gombe’s Premium Logistics Partner',
    slug: 'solvix-go-gombe-premium-logistics-partner',
    category: 'Company News',
    coverImage: { url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800' },
    body: '<p>At Solvix Go, our mission is to transform the logistics landscape in Gombe State. By blending modern technology, professional courier training, and localized routing algorithms, we have built a logistics powerhouse designed to elevate individual lives and corporate operations alike.</p><p>We understand that modern logistics is not just about getting packages from point A to point B. It is about speed, reliability, and unparalleled trust. Every courier in our navy fleet is trained to provide premium delivery and professional communication, ensuring that your customers feel valued upon receiving their orders.</p><h3>Why Businesses Choose Solvix Go</h3><ul><li><strong>Same-day dispatch:</strong> Guarantees prompt shipping across Gombe Metropolis.</li><li><strong>State-of-the-art handling:</strong> Safe transport of fragile items and documents.</li><li><strong>Transparent support:</strong> Real-time alerts and friendly customer dispatchers.</li></ul><p>We are continuously investing in expanding our reach to all nooks and crannies of Gombe, bringing robust shipping structures to everyone. Whether you run a high-volume merchant store or need a one-off home parcel delivery, Solvix Go is dedicated to making sure it arrives intact, clean, and in perfect time.</p>',
    tags: ['Logistics', 'Gombe', 'Business Growth'],
    isPublished: true,
    createdAt: '2026-05-10T12:00:00Z',
    publishedAt: '2026-05-10T12:00:00Z'
  },
  {
    _id: 'post-2',
    title: '5 Delivery Tips to Keep Your E-Commerce Customers Happy',
    slug: '5-delivery-tips-ecommerce-customers-happy',
    category: 'Delivery Tips',
    coverImage: { url: 'https://images.unsplash.com/photo-1566576206503-e2a2b998b2f8?auto=format&fit=crop&q=80&w=800' },
    body: '<p>In the competitive digital commerce environment, shipping is the final and most critical contact point between your brand and your buyer. A seamless shipping experience turns a one-time buyer into a loyal brand advocate. Here are five actionable delivery tips for Gombe e-commerce businesses:</p><ol><li><strong>Provide Clear Timing:</strong> Always set reasonable delivery expectations. Same-day is ideal, but communicating if a delivery is next-day prevents buyer anxiety.</li><li><strong>Use Premium Packaging:</strong> Ensure your items are packaged securely. Damp or torn packaging reflects poorly on your brand.</li><li><strong>Verify Contact Details:</strong> Double-check customer phone numbers and landmarks to minimize rider delays.</li><li><strong>Partner with a Professional Fleet:</strong> Avoid relying on unverified freelance riders. Partner with a brand like Solvix Go that holds riders to a premium standard of neatness and politeness.</li><li><strong>Collect Delivery Feedback:</strong> Follow up with customers to see if their package arrived in pristine condition.</li></ol><p>Implementing these tips requires persistence and dedication, but the dividends in customer retention and brand equity are extraordinary. Make logistics a core pillar of your e-commerce growth today.</p>',
    tags: ['E-Commerce', 'Customer Service', 'Shipping'],
    isPublished: true,
    createdAt: '2026-05-15T09:30:00Z',
    publishedAt: '2026-05-15T09:30:00Z'
  },
  {
    _id: 'post-3',
    title: 'How Local Vendors in Gombe Can Leverage On-Demand Delivery',
    slug: 'local-vendors-gombe-leverage-ondemand-delivery',
    category: 'Business Advice',
    coverImage: { url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800' },
    body: '<p>Small and medium enterprises (SMEs) are the backbone of Gombe’s economy. However, many vendors struggle to compete with larger retail giants due to the lack of built-in shipping infrastructures. On-demand logistics providers represent an affordable equalizer.</p><p>By leveraging Solvix Go’s tailored vendor subscription packages, local Gombe shops, bakery vendors, fashion designers, and food courts can offer instant door-to-door deliveries without the crushing capital expense of maintaining bikes, fueling them, or hiring full-time dispatchers.</p><h3>Major Benefits of Logistics Outsourcing:</h3><ul><li><strong>Zero Overhead:</strong> Pay only for the deliveries you make, turning logistics from a fixed cost into a variable cost.</li><li><strong>Wider Reach:</strong> Instantly serve customers in Federal Lowcost, Jekadafari, Tudun Wada, and new layouts.</li><li><strong>Better Cashflow:</strong> Spend capital on product quality rather than dispatch operational maintenance.</li></ul><p>Our packages are custom-tailored to provide support for any scale. Get in touch with our partnerships coordinator to construct a route bundle that satisfies your monthly metrics perfectly.</p>',
    tags: ['SMEs', 'Gombe', 'On-Demand Logistics'],
    isPublished: true,
    createdAt: '2026-05-18T14:45:00Z',
    publishedAt: '2026-05-18T14:45:00Z'
  },
  {
    _id: 'post-4',
    title: 'Partner Spotlight: Delivering Healthy Living with HealthPlus Gombe',
    slug: 'partner-spotlight-delivering-healthy-living-healthplus-gombe',
    category: 'Partner Spotlight',
    coverImage: { url: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&q=80&w=800' },
    body: '<p>We are excited to spotlight our close logistics collaboration with HealthPlus Pharmacy, Gombe Metropolis. Under this integration, customers requiring urgent prescriptions and health products can request Solvix Go dispatch directly from the pharmacy checkout counter.</p><p>Healthcare logistics requires high-precision execution. Medical supplies, vitamins, and specialized prescription items must be transported in dry, clean, and climate-protected dispatch packs. Our dedicated logistics team takes absolute precautions, ensuring Gombe residents receive life-saving medications quickly and safely.</p><p>This partnership underscores our wider commitment to offering premium, safe on-demand services across crucial utility areas like healthcare, pharmaceutical access, grocery logistics, and corporate document services in Gombe.</p>',
    tags: ['Healthcare', 'Partnership', 'Gombe Metropolis'],
    isPublished: true,
    createdAt: '2026-05-20T08:15:00Z',
    publishedAt: '2026-05-20T08:15:00Z'
  }
];

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
        } else {
          // Attempt offline fallback lookup
          const found = mockPosts.find(p => p.slug === slug);
          if (found) {
            setPost(found);
          }
        }
      })
      .catch(err => {
        console.log('API Single post load failed - looking up in local mock fallbacks.', err);
        const found = mockPosts.find(p => p.slug === slug);
        if (found) {
          setPost(found);
        }
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
        } else {
          const fallbackList = mockPosts.filter(p => p.slug !== slug).slice(0, 3);
          setRecentPosts(fallbackList);
        }
      })
      .catch(() => {
        const fallbackList = mockPosts.filter(p => p.slug !== slug).slice(0, 3);
        setRecentPosts(fallbackList);
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
                href="https://wa.me/2347079018011?text=Hello%20Solvix%20Go%2C%20I%20want%20to%20place%20an%20order!"
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
