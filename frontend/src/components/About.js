import './About.css';

function About() {
  return (
    <div className="about-tab">
      <section className="about-section">
        <h2>About Solidarity</h2>
        <p className="about-lead">
          Solidarity is a financial equity platform built to provide accessible, compliant, and transparent treasury management tools for individuals and organizations.
        </p>
      </section>

      <section className="about-section">
        <h3>Purpose</h3>
        <p>
          The platform exists to connect users with practical financial infrastructure — wallets, identity verification, AI-assisted decision support, and stablecoin treasury management — in a single, coherent system.
        </p>
        <p>
          Solidarity operates under the GENIUS Act stablecoin compliance framework. SLDRT tokens maintain transparent reserve backing and operate within clearly defined treasury structures.
        </p>
      </section>

      <section className="about-section">
        <h3>Mission</h3>
        <p>
          To build reliable financial tools that work for the people using them. Access to competent treasury management, identity verification, and AI-assisted analytics should not be limited by geography, institution, or net worth.
        </p>
      </section>

      <section className="about-section">
        <h3>Platform Functions</h3>
        <div className="functions-grid">
          <div className="function-card">
            <h4>Treasury Management</h4>
            <p>SLDRT stablecoin operations with transparent reserves and compliant issuance. Real-time balance tracking and transaction history.</p>
          </div>
          <div className="function-card">
            <h4>Coherence-Gated AI</h4>
            <p>AI assistant with coherence gating to ensure response quality. Available to authenticated users for financial analysis and planning support.</p>
          </div>
          <div className="function-card">
            <h4>Wallet Connectivity</h4>
            <p>Connect crypto wallets, bank accounts, and payment cards in one place. Unified view of holdings across chains and institutions.</p>
          </div>
          <div className="function-card">
            <h4>Hanko Stamp Verification</h4>
            <p>Multi-step identity verification system. Complete stamp collection to unlock tiered platform access and compliance clearance.</p>
          </div>
          <div className="function-card">
            <h4>Device Management</h4>
            <p>Register and manage trusted devices for secure access. Multi-device sync keeps sessions consistent across hardware.</p>
          </div>
          <div className="function-card">
            <h4>Financial Calculator</h4>
            <p>Tools for projecting yields, modeling treasury positions, and calculating token distribution schedules.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
