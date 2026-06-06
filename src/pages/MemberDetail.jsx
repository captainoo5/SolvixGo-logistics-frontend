import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../services/api';

const MemberDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    API.get(`/members/${slug}`)
      .then(res => {
        if (res.data.success && res.data.data) {
          setMember(res.data.data);
        } else {
          setError(true);
        }
      })
      .catch(err => {
        console.error('Failed to load member verification details:', err);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#090e24',
        color: '#fff',
        padding: '2rem'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid rgba(255, 255, 255, 0.1)',
          borderTopColor: '#10B981',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1.5rem'
        }}></div>
        <p style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: '0.05em', color: '#94A3B8' }}>
          VERIFYING SOLVIX ID CREDENTIALS...
        </p>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#090e24',
        color: '#fff',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ fontSize: '4.5rem', marginBottom: '1.5rem' }}>❌</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#EF4444', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Verification Failed
          </h1>
          <p style={{ color: '#94A3B8', maxWidth: '500px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
            The staff ID card scanned does not match any active record in the Solvix Go staff ledger. This ID card may be invalid, forged, or deactivated.
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '0.8rem 2rem',
              background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
              color: '#fff',
              border: '1px solid #334155',
              borderRadius: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Go to Homepage
          </button>
        </motion.div>
      </div>
    );
  }

  const verificationTime = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'medium'
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #090e24 0%, #030712 100%)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '4rem 1.5rem 2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background glow effects */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)',
        zIndex: 0,
        pointerEvents: 'none'
      }}></div>

      <div style={{ maxWidth: '650px', width: '100%', zIndex: 1 }}>
        {/* Verification Alert Badge */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '50px',
            padding: '0.6rem 1.5rem',
            margin: '0 auto 2.5rem',
            width: 'fit-content',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.15)'
          }}
        >
          <span style={{
            display: 'inline-block',
            width: '10px',
            height: '10px',
            background: '#10B981',
            borderRadius: '50%',
            animation: 'pulse 1.5s infinite'
          }}></span>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#10B981', letterSpacing: '0.05em' }}>
            SECURE VERIFIED SOLVIX STAFF
          </span>
          <style>{`
            @keyframes pulse {
              0% { transform: scale(0.95); opacity: 0.5; }
              50% { transform: scale(1.15); opacity: 1; box-shadow: 0 0 10px #10B981; }
              100% { transform: scale(0.95); opacity: 0.5; }
            }
          `}</style>
        </motion.div>

        {/* Security Holographic Badge Card */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '24px',
            padding: '2.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '2rem'
          }}
        >
          {/* Card Corner Security Patterns */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '80px',
            height: '80px',
            borderRight: '2px solid rgba(16, 185, 129, 0.4)',
            borderTop: '2px solid rgba(16, 185, 129, 0.4)',
            borderTopRightRadius: '24px',
            opacity: 0.6
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '80px',
            height: '80px',
            borderLeft: '2px solid rgba(16, 185, 129, 0.4)',
            borderBottom: '2px solid rgba(16, 185, 129, 0.4)',
            borderBottomLeftRadius: '24px',
            opacity: 0.6
          }}></div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            {/* Staff Photo */}
            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
              <div style={{
                position: 'absolute',
                inset: '-6px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10B981, #0694a2)',
                padding: '2px',
                animation: 'rotateGlow 6s linear infinite',
                zIndex: 0
              }}></div>
              <img
                src={member.image?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
                alt={member.name}
                style={{
                  width: '130px',
                  height: '130px',
                  objectFit: 'cover',
                  borderRadius: '50%',
                  position: 'relative',
                  zIndex: 1,
                  border: '4px solid #090e24'
                }}
              />
              <style>{`
                @keyframes rotateGlow {
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>

            {/* Name and Role */}
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
              {member.name}
            </h2>
            <div style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: '#10B981',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '1.5rem'
            }}>
              {member.role}
            </div>

            {/* Verification Metadata list */}
            <div style={{
              width: '100%',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: '16px',
              padding: '1.25rem',
              marginBottom: '2rem',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Employee Status</span>
                <span style={{ color: '#10B981', fontWeight: 800 }}>ACTIVE / VALID</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Verification Time</span>
                <span style={{ color: '#E2E8F0', fontWeight: 700 }}>{verificationTime}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Security Ledger ID</span>
                <span style={{ color: '#E2E8F0', fontFamily: 'monospace', fontWeight: 600 }}>
                  SLX-{member._id.slice(-8).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Bio / History Section */}
            {member.history && (
              <div style={{ width: '100%', textAlign: 'left', marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Professional Profile & History
                </h4>
                <p style={{ color: '#E2E8F0', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                  {member.history}
                </p>
              </div>
            )}

            {/* Hobby Section */}
            {member.hobby && (
              <div style={{ width: '100%', textAlign: 'left' }}>
                <h4 style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Hobbies & Interests
                </h4>
                <div style={{
                  display: 'inline-block',
                  background: 'rgba(255,255,255,0.06)',
                  padding: '0.4rem 1rem',
                  borderRadius: '50px',
                  fontSize: '0.85rem',
                  color: '#CBD5E1',
                  fontWeight: 600
                }}>
                  🎯 {member.hobby}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Security Footer Notice */}
        <p style={{
          textAlign: 'center',
          color: '#475569',
          fontSize: '0.78rem',
          lineHeight: 1.5,
          maxWidth: '450px',
          margin: '0 auto'
        }}>
          This verification page is an official digital service of <strong>Solvix Go Logistics Ltd</strong>. Scan code on ID card matches database signature. Unauthorized replication or spoofing is strictly prohibited.
        </p>
      </div>
    </div>
  );
};

export default MemberDetail;
