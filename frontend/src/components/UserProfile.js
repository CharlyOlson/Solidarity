import './UserProfile.css';

function UserProfile({ user, onLogout }) {
  const tierLabels = { free: 'Personal', pro: 'Pro', business: 'Business' };
  const tier = user?.tier || 'free';
  const tierLabel = tierLabels[tier] || 'Personal';

  return (
    <div className="user-profile">
      <div className="profile-card">
        <div className="profile-avatar">
          {(user?.email || 'U')[0].toUpperCase()}
        </div>
        <h2 className="profile-name">{user?.displayName || user?.email || 'User'}</h2>
        <span className={`tier-badge tier-${tier}`}>{tierLabel}</span>

        <div className="profile-details">
          <div className="profile-row">
            <span className="profile-label">Email</span>
            <span className="profile-value">{user?.email || '—'}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Tier</span>
            <span className="profile-value">{tierLabel}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Member since</span>
            <span className="profile-value">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</span>
          </div>
        </div>

        <button className="logout-button" onClick={onLogout}>
          Log Out
        </button>
      </div>
    </div>
  );
}

export default UserProfile;
