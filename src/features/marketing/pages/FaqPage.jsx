import { FaqList } from '../components/FaqList.jsx';
import { BRAND_FAQ, INFLUENCER_FAQ } from '../content/faq.js';

export function FaqPage() {
  return (
    <div className="wrap" style={{ maxWidth: 820, padding: '40px 20px 60px' }}>
      <h1 style={{ fontSize: '2.2rem' }}>Foire aux questions</h1>
      <h2 className="h3" style={{ marginTop: 24 }}>Annonceurs</h2>
      <FaqList items={BRAND_FAQ} />
      <h2 className="h3" style={{ marginTop: 36 }}>Influenceurs</h2>
      <FaqList items={INFLUENCER_FAQ} />
    </div>
  );
}
