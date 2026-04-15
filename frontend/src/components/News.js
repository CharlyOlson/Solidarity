import './News.css';

const NEWS_ITEMS = [
  {
    id: 1,
    title: 'Solidarity Platform Public Beta',
    description: 'The Solidarity financial equity platform is now open for early access. Users can create accounts, connect wallets, and explore core treasury management features.',
    date: 'April 12, 2026'
  },
  {
    id: 2,
    title: 'GENIUS Act and Stablecoin Compliance',
    description: 'The platform has been designed with the GENIUS Act stablecoin framework in mind. SLDRT tokens operate within compliant treasury structures and maintain transparent reserve backing.',
    date: 'April 8, 2026'
  },
  {
    id: 3,
    title: 'Hanko Stamp Verification System',
    description: 'Identity verification through the Hanko stamp system is now active. Users can complete multi-step identity confirmation to unlock full platform access.',
    date: 'March 30, 2026'
  },
  {
    id: 4,
    title: 'Coherence-Gated AI Integration',
    description: 'The AI assistant now uses coherence gating to ensure response quality. Chat sessions are available to authenticated users with verified accounts.',
    date: 'March 22, 2026'
  }
];

function News() {
  return (
    <div className="news-tab">
      <h2>Latest Updates</h2>
      <div className="news-grid">
        {NEWS_ITEMS.map((item) => (
          <div key={item.id} className="news-card">
            <div className="news-date">{item.date}</div>
            <h3 className="news-title">{item.title}</h3>
            <p className="news-description">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default News;
