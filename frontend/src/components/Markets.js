import './Markets.css';

function generateSampleData(basePrice, volatility, trend, points) {
  const data = [];
  let price = basePrice;
  for (let i = 0; i < points; i++) {
    price += (Math.random() - 0.48 + trend) * volatility;
    if (price < basePrice * 0.7) price = basePrice * 0.7;
    data.push(Math.round(price * 100) / 100);
  }
  return data;
}

const SEED_MARKETS = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    price: 3245.82,
    change: 2.14,
    data: generateSampleData(3100, 40, 0.02, 30),
    section: 'crypto'
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 68421.50,
    change: 1.37,
    data: generateSampleData(67000, 500, 0.015, 30),
    section: 'crypto'
  },
  {
    symbol: 'SLDRT',
    name: 'Solidarity Token',
    price: 1.00,
    change: 0.02,
    data: generateSampleData(0.98, 0.005, 0.001, 30),
    section: 'crypto'
  },
  {
    symbol: 'S&P 500',
    name: 'S&P 500 Index',
    price: 5248.30,
    change: -0.43,
    data: generateSampleData(5280, 20, -0.005, 30),
    section: 'traditional'
  },
  {
    symbol: 'NASDAQ',
    name: 'NASDAQ Composite',
    price: 16412.75,
    change: -0.28,
    data: generateSampleData(16500, 60, -0.003, 30),
    section: 'traditional'
  }
];

function MiniLineChart({ data, positive }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 200;
  const height = 60;
  const padding = 4;

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((val - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const strokeColor = positive ? '#4CAF50' : '#C62828';
  const fillColor = positive ? 'rgba(76,175,80,0.1)' : 'rgba(198,40,40,0.1)';

  const areaPoints = `${padding},${height - padding} ${points.join(' ')} ${width - padding},${height - padding}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="mini-chart-svg">
      <polygon points={areaPoints} fill={fillColor} />
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MarketCard({ market }) {
  const positive = market.change >= 0;
  return (
    <div className="market-card">
      <div className="market-header-row">
        <div>
          <span className="market-symbol">{market.symbol}</span>
          <span className="market-name">{market.name}</span>
        </div>
        <div className="market-price-block">
          <span className="market-price">
            ${market.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className={`market-change ${positive ? 'positive' : 'negative'}`}>
            {positive ? '+' : ''}{market.change.toFixed(2)}%
          </span>
        </div>
      </div>
      <div className="market-chart-area">
        <MiniLineChart data={market.data} positive={positive} />
      </div>
    </div>
  );
}

function Markets() {
  const crypto = SEED_MARKETS.filter((m) => m.section === 'crypto');
  const traditional = SEED_MARKETS.filter((m) => m.section === 'traditional');

  return (
    <div className="markets-tab">
      <h2>Markets</h2>

      <div className="market-section">
        <h3 className="market-section-title">Crypto</h3>
        <div className="market-grid">
          {crypto.map((m) => (
            <MarketCard key={m.symbol} market={m} />
          ))}
        </div>
      </div>

      <div className="market-section">
        <h3 className="market-section-title">Traditional</h3>
        <div className="market-grid">
          {traditional.map((m) => (
            <MarketCard key={m.symbol} market={m} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Markets;
