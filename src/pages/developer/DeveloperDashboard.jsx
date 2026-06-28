import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import logoImg from '../../assets/logo.png';
import { subscribeToWebPush } from '../../utils/webPushHelper';

const DeveloperDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'keys', 'docs', 'logs'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [developerInfo, setDeveloperInfo] = useState(null);
  const [stats, setStats] = useState({
    status: 'pending',
    apiStatus: 'Inactive',
    totalRequests: 0,
    successfulDeliveries: 0,
    failedRequests: 0
  });

  // Keys & Webhook states
  const [keysData, setKeysData] = useState(null);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [regeneratedKeys, setRegeneratedKeys] = useState(null); // stores temporary raw secret keys
  const [keysLoading, setKeysLoading] = useState(false);
  const [keysError, setKeysError] = useState('');
  const [keysSuccess, setKeysSuccess] = useState('');

  // Webhook save states
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [webhookSuccess, setWebhookSuccess] = useState('');

  // Logs state
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('developer_token');
    if (!token) {
      navigate('/developers');
      return;
    }
    
    // Fetch profile, stats, keys, and logs
    fetchDeveloperData();
    subscribeToWebPush().catch(err => console.error('PWA push registration failed:', err.message));
  }, [navigate]);

  const fetchDeveloperData = async () => {
    try {
      // 1. Profile info
      const profileRes = await API.get('/developer-portal/me');
      setDeveloperInfo(profileRes.data.data);
      setWebhookUrl(profileRes.data.data.webhookUrl || '');
      setWebhookSecret(profileRes.data.data.webhookSecret || '');

      // 2. Stats overview
      const statsRes = await API.get('/developer-portal/dashboard');
      setStats(statsRes.data.data);

      // 3. Credentials info
      const keysRes = await API.get('/developer-portal/keys');
      setKeysData(keysRes.data.data);

      // 4. API Logs
      fetchLogs();

    } catch (err) {
      console.error('Failed to load developer dashboard data', err);
    }
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const logsRes = await API.get('/developer-portal/logs');
      setLogs(logsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleRegenerateKeys = async () => {
    if (!window.confirm('Are you sure you want to regenerate your API keys? This will deactivate your current keys immediately.')) {
      return;
    }

    setKeysLoading(true);
    setKeysError('');
    setKeysSuccess('');
    setRegeneratedKeys(null);

    try {
      const res = await API.post('/developer-portal/keys/regenerate');
      if (res.data.success) {
        setRegeneratedKeys(res.data.data);
        setKeysSuccess('API keys generated successfully. Copy your secret key now! It will not be shown again.');
        // Update credentials state
        setKeysData({
          publicKey: res.data.data.publicKey,
          isActive: res.data.data.isActive,
          createdAt: res.data.data.createdAt
        });
        // Update stats status
        setStats(prev => ({ ...prev, apiStatus: 'Active' }));
      }
    } catch (err) {
      console.error(err);
      setKeysError(err.response?.data?.message || 'Failed to regenerate API keys.');
    } finally {
      setKeysLoading(false);
    }
  };

  const handleToggleKeys = async () => {
    setKeysLoading(true);
    setKeysError('');
    setKeysSuccess('');

    try {
      const res = await API.post('/developer-portal/keys/toggle');
      if (res.data.success) {
        setKeysData(res.data.data);
        setKeysSuccess(`API Keys successfully ${res.data.data.isActive ? 'enabled' : 'disabled'}.`);
        setStats(prev => ({ ...prev, apiStatus: res.data.data.isActive ? 'Active' : 'Inactive' }));
      }
    } catch (err) {
      console.error(err);
      setKeysError(err.response?.data?.message || 'Failed to toggle API keys.');
    } finally {
      setKeysLoading(false);
    }
  };

  const handleUpdateWebhook = async (e) => {
    e.preventDefault();
    setWebhookLoading(true);
    setWebhookSuccess('');

    try {
      const res = await API.put('/developer-portal/webhook', { webhookUrl });
      if (res.data.success) {
        setWebhookSuccess('Webhook URL updated successfully!');
        setWebhookSecret(res.data.data.webhookSecret);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update webhook URL.');
    } finally {
      setWebhookLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('developer_token');
    localStorage.removeItem('developer_info');
    navigate('/developers');
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    alert(`${type} copied to clipboard!`);
  };

  const renderOverviewTab = () => {
    const isApproved = stats.status === 'approved';
    const isPending = stats.status === 'pending';
    const isSuspended = stats.status === 'suspended';
    const isRejected = stats.status === 'rejected';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Status Callouts */}
        {isPending && (
          <div style={{ background: '#FFFBEB', borderLeft: '4px solid #F59E0B', padding: '1.5rem', borderRadius: '12px', color: '#B45309' }}>
            <h4 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Review Pending</h4>
            <p style={{ fontSize: '0.9rem' }}>
              Your developer integration profile is currently pending review by our administration team. You will be able to generate API keys and activate webhooks once your profile is approved.
            </p>
          </div>
        )}

        {isSuspended && (
          <div style={{ background: '#FEF2F2', borderLeft: '4px solid #EF4444', padding: '1.5rem', borderRadius: '12px', color: '#B91C1C' }}>
            <h4 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Account Suspended</h4>
            <p style={{ fontSize: '0.9rem' }}>
              Your developer integration has been suspended by an administrator. All active API requests using your keys will fail with a 403 Forbidden status.
            </p>
          </div>
        )}

        {isRejected && (
          <div style={{ background: '#FEF2F2', borderLeft: '4px solid #EF4444', padding: '1.5rem', borderRadius: '12px', color: '#B91C1C' }}>
            <h4 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Application Rejected</h4>
            <p style={{ fontSize: '0.9rem' }}>
              Unfortunately, your application for developer access was rejected. Please contact our support team if you believe this is an error.
            </p>
          </div>
        )}

        {isApproved && (
          <div style={{ background: '#ECFDF5', borderLeft: '4px solid #10B981', padding: '1.5rem', borderRadius: '12px', color: '#047857' }}>
            <h4 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Integration Active</h4>
            <p style={{ fontSize: '0.9rem' }}>
              Congratulations! Your developer status is approved. You can generate API credentials in the "API Credentials" tab and start dispatching orders.
            </p>
          </div>
        )}

        {/* Dashboard Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', boxShadow: 'var(--card-shadow)', border: '1px solid rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--gray-light)', marginBottom: '0.5rem' }}>API Integration Status</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: stats.apiStatus === 'Active' ? '#10B981' : '#64748B' }}>
              {stats.apiStatus}
            </div>
          </div>

          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', boxShadow: 'var(--card-shadow)', border: '1px solid rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--gray-light)', marginBottom: '0.5rem' }}>Total API Requests</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy)' }}>
              {stats.totalRequests}
            </div>
          </div>

          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', boxShadow: 'var(--card-shadow)', border: '1px solid rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--gray-light)', marginBottom: '0.5rem' }}>Successful Deliveries</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10B981' }}>
              {stats.successfulDeliveries}
            </div>
          </div>

          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', boxShadow: 'var(--card-shadow)', border: '1px solid rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--gray-light)', marginBottom: '0.5rem' }}>Failed API Requests</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#EF4444' }}>
              {stats.failedRequests}
            </div>
          </div>

        </div>

        {/* Integration Details Panel */}
        <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--card-shadow)', border: '1px solid rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '1rem' }}>Company Details</h3>
          {developerInfo && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', fontSize: '0.95rem' }}>
              <div>
                <p style={{ color: 'var(--gray-light)', marginBottom: '0.2rem' }}>Company Name</p>
                <p style={{ fontWeight: 600, color: 'var(--navy)' }}>{developerInfo.companyName}</p>
              </div>
              <div>
                <p style={{ color: 'var(--gray-light)', marginBottom: '0.2rem' }}>Contact Person</p>
                <p style={{ fontWeight: 600, color: 'var(--navy)' }}>{developerInfo.contactPerson}</p>
              </div>
              <div>
                <p style={{ color: 'var(--gray-light)', marginBottom: '0.2rem' }}>Email Address</p>
                <p style={{ fontWeight: 600, color: 'var(--navy)' }}>{developerInfo.email}</p>
              </div>
              <div>
                <p style={{ color: 'var(--gray-light)', marginBottom: '0.2rem' }}>Phone Number</p>
                <p style={{ fontWeight: 600, color: 'var(--navy)' }}>{developerInfo.phone}</p>
              </div>
            </div>
          )}
        </div>

      </div>
    );
  };

  const renderKeysTab = () => {
    const isApproved = stats.status === 'approved';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        
        {/* Keys Panel */}
        <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--card-shadow)', border: '1px solid rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.5rem' }}>API Keys</h3>
          <p style={{ color: 'var(--gray-text)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            Use these keys to authenticate requests from your servers. Make sure to keep your secret key hidden.
          </p>

          {keysSuccess && (
            <div style={{ background: 'rgba(16, 185, 129, 0.12)', borderLeft: '4px solid #10B981', color: '#047857', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
              {keysSuccess}
            </div>
          )}
          
          {keysError && (
            <div style={{ background: 'rgba(239, 68, 68, 0.12)', borderLeft: '4px solid #EF4444', color: '#B91C1C', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
              {keysError}
            </div>
          )}

          {regeneratedKeys && (
            <div style={{ background: '#FAF5FF', border: '1.5px dashed #A855F7', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
              <h4 style={{ color: '#6B21A8', fontWeight: 700, marginBottom: '0.5rem' }}>✓ Secret Key Generated!</h4>
              <p style={{ fontSize: '0.85rem', color: '#6B21A8', marginBottom: '1rem' }}>
                Please write down or copy this key. <strong>It will not be displayed again</strong> for security reasons.
              </p>
              <div style={{ background: 'rgba(255,255,255,0.8)', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid #E9D5FF', display: 'flex', justifyContent: 'between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <code style={{ fontSize: '0.9rem', color: '#6B21A8', fontWeight: 'bold', wordBreak: 'break-all' }}>{regeneratedKeys.secretKey}</code>
                <button
                  onClick={() => copyToClipboard(regeneratedKeys.secretKey, 'Secret Key')}
                  style={{ background: '#A855F7', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                >
                  Copy Key
                </button>
              </div>
            </div>
          )}

          {!isApproved ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--gray-light)', background: '#F8FAFC', borderRadius: '12px' }}>
              🔒 API credentials will become available once your developer application is approved.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--gray-light)', marginBottom: '0.5rem' }}>Public Key (X-Solvix-Public-Key)</label>
                {keysData ? (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      readOnly
                      value={keysData.publicKey}
                      style={{ flex: 1, padding: '0.8rem 1.25rem', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '0.9rem', outline: 'none' }}
                    />
                    <button
                      onClick={() => copyToClipboard(keysData.publicKey, 'Public Key')}
                      style={{ background: 'var(--navy)', color: '#fff', border: 'none', padding: '0.8rem 1.25rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Copy
                    </button>
                  </div>
                ) : (
                  <p style={{ color: 'var(--gray-light)', fontSize: '0.9rem' }}>No API keys generated yet. Click generate below.</p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--gray-light)', marginBottom: '0.5rem' }}>Secret Key (X-Solvix-Secret-Key)</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    readOnly
                    value="••••••••••••••••••••••••••••••••••••••••••••••••"
                    style={{ flex: 1, padding: '0.8rem 1.25rem', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '0.9rem', outline: 'none' }}
                  />
                  <button
                    disabled
                    style={{ background: '#CBD5E1', color: '#94A3B8', border: 'none', padding: '0.8rem 1.25rem', borderRadius: '10px', cursor: 'not-allowed', fontWeight: 600 }}
                  >
                    Secret
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  disabled={keysLoading}
                  onClick={handleRegenerateKeys}
                  className="btn btn-orange"
                  style={{ borderRadius: '10px', padding: '0.75rem 1.5rem' }}
                >
                  {keysData ? 'Regenerate API Keys' : 'Generate API Keys'}
                </button>

                {keysData && (
                  <button
                    type="button"
                    disabled={keysLoading}
                    onClick={handleToggleKeys}
                    className="btn"
                    style={{
                      borderRadius: '10px',
                      padding: '0.75rem 1.5rem',
                      background: keysData.isActive ? '#EF4444' : '#10B981',
                      color: '#fff'
                    }}
                  >
                    {keysData.isActive ? 'Disable API Keys' : 'Enable API Keys'}
                  </button>
                )}
              </div>

            </div>
          )}
        </div>

        {/* Webhook Panel */}
        <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--card-shadow)', border: '1px solid rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.5rem' }}>Webhook Configuration</h3>
          <p style={{ color: 'var(--gray-text)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            Set up webhooks to receive real-time POST events whenever a delivery order status changes.
          </p>

          {webhookSuccess && (
            <div style={{ background: 'rgba(16, 185, 129, 0.12)', borderLeft: '4px solid #10B981', color: '#047857', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
              {webhookSuccess}
            </div>
          )}

          {!isApproved ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--gray-light)', background: '#F8FAFC', borderRadius: '12px' }}>
              🔒 Webhooks will become available once your developer application is approved.
            </div>
          ) : (
            <form onSubmit={handleUpdateWebhook} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--gray-light)', marginBottom: '0.5rem' }}>Webhook Destination URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://your-api.com/webhooks/solvix"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem 1.25rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>

              {webhookSecret && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--gray-light)', marginBottom: '0.5rem' }}>Webhook Signing Secret (HMAC-SHA256)</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      readOnly
                      value={webhookSecret}
                      style={{ flex: 1, padding: '0.8rem 1.25rem', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '0.9rem', outline: 'none', fontFamily: 'monospace' }}
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard(webhookSecret, 'Signing Secret')}
                      style={{ background: 'var(--navy)', color: '#fff', border: 'none', padding: '0.8rem 1.25rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Copy
                    </button>
                  </div>
                  <p style={{ color: 'var(--gray-light)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                    Webhooks are signed using this secret in the <code>X-Solvix-Signature</code> header.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={webhookLoading}
                className="btn btn-orange"
                style={{ alignSelf: 'flex-start', borderRadius: '10px', padding: '0.75rem 1.5rem' }}
              >
                {webhookLoading ? 'Saving...' : 'Save Webhook Destination'}
              </button>
            </form>
          )}
        </div>

      </div>
    );
  };

  const renderLogsTab = () => {
    return (
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--card-shadow)', border: '1px solid rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--navy)' }}>API Usage Logs</h3>
            <p style={{ color: 'var(--gray-text)', fontSize: '0.9rem' }}>Recent API requests made with your credentials (max 100).</p>
          </div>
          <button
            onClick={fetchLogs}
            disabled={logsLoading}
            style={{ padding: '0.5rem 1rem', background: '#F1F5F9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
          >
            {logsLoading ? 'Refreshing...' : '🔄 Refresh Logs'}
          </button>
        </div>

        {logsLoading && logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Loading log history...</div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-light)' }}>No API logs found yet. Start sending API requests to view usage.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #F1F5F9', color: 'var(--gray-light)', fontWeight: 700 }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Method</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Endpoint</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Latency</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const isErr = log.statusCode >= 400;
                  return (
                    <tr key={log._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: log.method === 'POST' ? '#3B82F6' : '#10B981' }}>{log.method}</td>
                      <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', color: 'var(--navy)' }}>{log.endpoint}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                          background: isErr ? '#FEF2F2' : '#ECFDF5',
                          color: isErr ? '#EF4444' : '#10B981',
                          fontWeight: 700,
                          fontSize: '0.8rem'
                        }}>
                          {log.statusCode}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--gray-text)' }}>{log.responseTime}ms</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--gray-light)', fontSize: '0.85rem' }}>{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderDocsTab = () => {
    return (
      <div style={{ background: '#fff', padding: '2.5rem 2rem', borderRadius: '16px', boxShadow: 'var(--card-shadow)', border: '1px solid rgba(0,0,0,0.03)', color: 'var(--navy)', lineHeight: 1.7 }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem', borderBottom: '2px solid #F1F5F9', paddingBottom: '0.5rem' }}>API Integration Reference</h2>
        
        {/* Intro */}
        <p style={{ color: 'var(--gray-text)', marginBottom: '2rem' }}>
          This reference outlines how to connect your platform to Solvix Go Logistics. All requests must use HTTPS and send JSON payloads.
        </p>

        {/* Section: Authentication */}
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--navy)', marginTop: '2rem', marginBottom: '0.75rem' }}>1. Authentication</h3>
        <p style={{ color: 'var(--gray-text)', marginBottom: '1rem' }}>
          All delivery request endpoints must include the following headers for authorization:
        </p>
        <div style={{ background: '#F8FAFC', padding: '1rem 1.5rem', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '1.5rem' }}>
          <code style={{ fontSize: '0.85rem', display: 'block', whiteSpace: 'pre-wrap' }}>
            X-Solvix-Public-Key: SOLVIX_PUBLIC_your_public_key_here<br />
            X-Solvix-Secret-Key: SOLVIX_SECRET_your_secret_key_here
          </code>
        </div>

        {/* Section: Create order */}
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--navy)', marginTop: '2rem', marginBottom: '0.75rem' }}>2. Create Delivery Request</h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{ background: '#3B82F6', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>POST</span>
          <code style={{ fontWeight: 700, fontSize: '0.95rem' }}>/api/v1/developer/order</code>
        </div>
        
        <p style={{ color: 'var(--gray-text)', marginBottom: '0.5rem' }}><strong>Request Payload:</strong></p>
        <pre style={{ background: '#1E293B', color: '#F8F9FA', padding: '1rem 1.5rem', borderRadius: '10px', overflowX: 'auto', fontSize: '0.85rem', marginBottom: '1.5rem' }}>{`{
  "pickupName": "Solvix Store",
  "pickupAddress": "24 Allen Avenue, Ikeja, Lagos",
  "receiverName": "Jane Doe",
  "receiverPhone": "08123456789",
  "deliveryAddress": "12 Toyin Street, Ikeja, Lagos",
  "packageDescription": "Assorted cupcakes box",
  "paymentType": "Cash"
}`}</pre>

        <p style={{ color: 'var(--gray-text)', marginBottom: '0.5rem' }}><strong>Response Format (201 Created):</strong></p>
        <pre style={{ background: '#1E293B', color: '#F8F9FA', padding: '1rem 1.5rem', borderRadius: '10px', overflowX: 'auto', fontSize: '0.85rem', marginBottom: '2rem' }}>{`{
  "success": true,
  "data": {
    "deliveryId": "65b902e4822...",
    "status": "Pending",
    "pickupName": "Solvix Store",
    "pickupAddress": "24 Allen Avenue, Ikeja, Lagos",
    "receiverName": "Jane Doe",
    "receiverPhone": "08123456789",
    "deliveryAddress": "12 Toyin Street, Ikeja, Lagos",
    "packageDescription": "Assorted cupcakes box",
    "createdAt": "2026-06-28T00:00:00.000Z"
  }
}`}</pre>

        {/* Section: Track order */}
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--navy)', marginTop: '2rem', marginBottom: '0.75rem' }}>3. Track Delivery Status</h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{ background: '#10B981', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>GET</span>
          <code style={{ fontWeight: 700, fontSize: '0.95rem' }}>/api/v1/developer/order/:id</code>
        </div>

        <p style={{ color: 'var(--gray-text)', marginBottom: '0.5rem' }}><strong>Response Format (200 OK):</strong></p>
        <pre style={{ background: '#1E293B', color: '#F8F9FA', padding: '1rem 1.5rem', borderRadius: '10px', overflowX: 'auto', fontSize: '0.85rem', marginBottom: '2rem' }}>{`{
  "success": true,
  "data": {
    "deliveryId": "65b902e4822...",
    "status": "In Transit",
    "riderName": "Emeka Rider",
    "pickupAddress": "24 Allen Avenue, Ikeja, Lagos",
    "deliveryAddress": "12 Toyin Street, Ikeja, Lagos",
    "createdAt": "2026-06-28T00:00:00.000Z"
  }
}`}</pre>

        {/* Section: Cancel order */}
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--navy)', marginTop: '2rem', marginBottom: '0.75rem' }}>4. Cancel Delivery Request</h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{ background: '#3B82F6', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>POST</span>
          <code style={{ fontWeight: 700, fontSize: '0.95rem' }}>/api/v1/developer/order/:id/cancel</code>
        </div>

        <p style={{ color: 'var(--gray-text)', marginBottom: '0.5rem' }}><strong>Response Format (200 OK):</strong></p>
        <pre style={{ background: '#1E293B', color: '#F8F9FA', padding: '1rem 1.5rem', borderRadius: '10px', overflowX: 'auto', fontSize: '0.85rem', marginBottom: '2rem' }}>{`{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "deliveryId": "65b902e4822...",
    "status": "Cancelled"
  }
}`}</pre>

        {/* Section: Webhooks */}
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--navy)', marginTop: '2rem', marginBottom: '0.75rem' }}>5. Webhook System & Signing</h3>
        <p style={{ color: 'var(--gray-text)', marginBottom: '1rem' }}>
          When order status changes to <code>assigned</code>, <code>picked_up</code>, <code>in_transit</code>, <code>delivered</code>, or <code>cancelled</code>, we will trigger a POST request with the following JSON structure to your saved webhook URL:
        </p>
        <pre style={{ background: '#1E293B', color: '#F8F9FA', padding: '1rem 1.5rem', borderRadius: '10px', overflowX: 'auto', fontSize: '0.85rem', marginBottom: '1.5rem' }}>{`{
  "deliveryId": "65b902e4822...",
  "status": "in_transit",
  "riderName": "Emeka Rider",
  "timestamp": "2026-06-28T00:05:00.000Z"
}`}</pre>
        <p style={{ color: 'var(--gray-text)', marginBottom: '1rem' }}>
          To verify that the webhook came from Solvix Go, we calculate a cryptographically secure signature using your webhook signing secret. Verify this value matches the header:
        </p>
        <div style={{ background: '#F8FAFC', padding: '1.25rem', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          <strong>Header:</strong> <code>X-Solvix-Signature</code><br />
          <strong>Algorithm:</strong> HMAC-SHA256 of the raw body payload using your Webhook Signing Secret.
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', fontFamily: 'var(--font)' }}>
      {/* ── MOBILE TOP HEADER ── */}
      <div className="mobile-developer-header" style={{
        display: 'none',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--navy, #0A1128)',
        color: '#fff',
        padding: '0.75rem 1.5rem',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        zIndex: 1000,
        boxShadow: '0 2px 10px rgba(0,0,0,0.15)'
      }}>
        <img src={logoImg} alt="Solvix Go Logo" style={{ height: '32px', objectFit: 'contain' }} />
        <button onClick={() => setIsSidebarOpen(prev => !prev)} style={{
          background: 'transparent',
          border: 'none',
          color: '#fff',
          fontSize: '1.5rem',
          cursor: 'pointer',
          padding: '0.25rem 0.5rem'
        }}>
          ☰
        </button>
      </div>

      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 10000,
            display: 'block'
          }}
        />
      )}

      {/* Sidebar navigation */}
      <div className={`developer-sidebar ${isSidebarOpen ? 'open' : ''}`} style={{
        width: '280px',
        background: 'var(--navy, #0A1128)',
        color: '#fff',
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2.5rem',
        height: '100vh',
        position: 'sticky',
        top: 0,
        overflowY: 'auto',
        flexShrink: 0
      }}>
        
        {/* Brand/Logo Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src={logoImg} alt="Logo" style={{ height: '35px', objectFit: 'contain' }} />
          <div>
            <h4 style={{ fontWeight: 800, margin: 0 }}>Solvix<span style={{ color: 'var(--orange)' }}>Dev</span></h4>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 700 }}>Integration Console</span>
          </div>
        </div>

        {/* Nav Links */}
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li>
            <button
              onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }}
              style={{
                width: '100%',
                background: activeTab === 'overview' ? 'rgba(255,255,255,0.08)' : 'none',
                border: 'none',
                color: activeTab === 'overview' ? '#fff' : 'rgba(255,255,255,0.6)',
                textAlign: 'left',
                padding: '0.8rem 1.2rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                transition: 'all 0.2s'
              }}
            >
              📊 Overview
            </button>
          </li>
          <li>
            <button
              onClick={() => { setActiveTab('keys'); setIsSidebarOpen(false); }}
              style={{
                width: '100%',
                background: activeTab === 'keys' ? 'rgba(255,255,255,0.08)' : 'none',
                border: 'none',
                color: activeTab === 'keys' ? '#fff' : 'rgba(255,255,255,0.6)',
                textAlign: 'left',
                padding: '0.8rem 1.2rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                transition: 'all 0.2s'
              }}
            >
              🔑 API Credentials
            </button>
          </li>
          <li>
            <button
              onClick={() => { setActiveTab('logs'); setIsSidebarOpen(false); }}
              style={{
                width: '100%',
                background: activeTab === 'logs' ? 'rgba(255,255,255,0.08)' : 'none',
                border: 'none',
                color: activeTab === 'logs' ? '#fff' : 'rgba(255,255,255,0.6)',
                textAlign: 'left',
                padding: '0.8rem 1.2rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                transition: 'all 0.2s'
              }}
            >
              📝 API Logs
            </button>
          </li>
          <li>
            <button
              onClick={() => { setActiveTab('docs'); setIsSidebarOpen(false); }}
              style={{
                width: '100%',
                background: activeTab === 'docs' ? 'rgba(255,255,255,0.08)' : 'none',
                border: 'none',
                color: activeTab === 'docs' ? '#fff' : 'rgba(255,255,255,0.6)',
                textAlign: 'left',
                padding: '0.8rem 1.2rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                transition: 'all 0.2s'
              }}
            >
              📖 Documentation
            </button>
          </li>
        </ul>

        {/* Footer/Logout */}
        <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#FCA5A5',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}
          >
            🚪 Sign Out
          </button>
        </div>

      </div>

      {/* Main Content Area */}
      <div className="developer-main-content" style={{ flex: 1, padding: '2.5rem 5% 4rem', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--gray-light)', fontWeight: 700, textTransform: 'uppercase' }}>Console / {activeTab}</span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--navy)', margin: 0 }}>
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Dashboard
              </h2>
            </div>
            
            {developerInfo && (
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontWeight: 700, color: 'var(--navy)' }}>{developerInfo.companyName}</span>
                <span style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: stats.status === 'approved' ? '#10B981' : (stats.status === 'pending' ? '#F59E0B' : '#EF4444')
                }}>
                  ● {stats.status}
                </span>
              </div>
            )}
          </div>

          {/* Render Tabs */}
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'keys' && renderKeysTab()}
          {activeTab === 'logs' && renderLogsTab()}
          {activeTab === 'docs' && renderDocsTab()}

        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .mobile-developer-header {
            display: flex !important;
          }
          .developer-sidebar {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            bottom: 0 !important;
            z-index: 10001 !important;
            transform: translateX(-100%);
            transition: transform 0.3s ease-in-out !important;
            display: flex !important;
            width: 280px !important;
            height: 100vh !important;
          }
          .developer-sidebar.open {
            transform: translateX(0) !important;
          }
          .developer-sidebar ~ .developer-main-content {
            padding-top: 5rem !important;
            padding-left: 1.25rem !important;
            padding-right: 1.25rem !important;
          }
        }
      `}} />
    </div>
  );
};

export default DeveloperDashboard;
