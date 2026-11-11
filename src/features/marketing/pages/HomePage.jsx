import { useState } from 'react';
import { Link } from 'react-router-dom';
import creatorPhoto from '@/assets/creator.jpg';
import { Skeleton } from '@/components/feedback/Skeleton/Skeleton.jsx';
import { Carousel } from '@/components/ui/Carousel/Carousel.jsx';
import { Chip } from '@/components/ui/Chip/Chip.jsx';
import { Floaters, Orbs } from '@/components/ui/Decor/Decor.jsx';
import { Icon } from '@/components/ui/Icon/Icon.jsx';
import { Kpi, KpiGrid } from '@/components/ui/Kpi/Kpi.jsx';
import { Pill } from '@/components/ui/Pill/Pill.jsx';
import { CATS, NET } from '@/domain/catalog.js';
import { useSession } from '@/features/auth/index.js';
import { InfluencerCard, VitrineCard, useCarouselItems, useDirectory } from '@/features/influencers/index.js';
import { useFlags } from '@/features/platform/index.js';
import { formatCompact } from '@/lib/format.js';
import { FaqList } from '../components/FaqList.jsx';
import { BRAND_FAQ } from '../content/faq.js';
import { useRotatingWord } from '../hooks/useRotatingWord.js';

const ROT_WORDS = [
  'd\'influenceurs vérifiés.',
  'des stars de TikTok.',
  'd\'humoristes ivoiriens.',
  'des reines de la beauté.',
  'des passionnés de foot.',
  'de créateurs engagés.',
];

const FEATURES = [
  ['shield', 'Paiements garantis', 'Les fonds restent chez PULLUP jusqu\'à la validation de la publication. Pas de publication, pas de paiement.'],
  ['tag', 'Tarifs transparents', 'Chaque vitrine affiche ses prix à l\'avance. Vous savez ce que paient les autres marques.'],
  ['start', 'Score PULLUP', 'Une note exclusive calculée sur l\'authenticité de l\'audience et les résultats des campagnes passées.'],
  ['chart', 'Suivi et mesures', 'Statistiques par campagne et par influenceur, liens UTM pour savoir qui ramène des ventes.'],
  ['people', 'Audience détaillée', 'Âge, genre et villes des abonnés pour viser exactement votre marché.'],
  ['audit', 'Audits quotidiens', 'Nous contrôlons chaque jour les comptes pour écarter faux abonnés et vues achetées.'],
];

const GHOST_LIGHT = { color: '#fff', boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,.55)' };

function RoadmapItem({ version, title, on, items }) {
  return (
    <div className={on ? 'rm' : 'rm off'}>
      <div className="row between">
        <span className="v">{version}</span>
        {on ? <Pill tone="ok">Active</Pill> : <Pill tone="mute">Bientôt</Pill>}
      </div>
      <h3 className="h4" style={{ marginTop: 10 }}>{title}</h3>
      <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
    </div>
  );
}

function TopProfiles({ role, v2 }) {
  const [filter, setFilter] = useState('reco');
  const { data: items, isPending } = useCarouselItems(filter);
  const filters = [
    ['reco', role === 'brand' ? 'Recommandés pour vous' : 'Les mieux notés'],
    ['humour', '😂 Humour'],
    ['beaute', '💄 Beauté'],
    ['tech', '📱 Hi-tech'],
    ['sport', '⚽ Sport'],
    ['food', '🍲 Food'],
    ['montee', '📈 En montée'],
  ];
  const label = filters.find(([key]) => key === filter)?.[1] ?? '';

  let track;
  if (isPending) track = <Skeleton height={260} />;
  else if (!items?.length) track = <p className="muted">Aucun profil dans cette catégorie pour le moment.</p>;
  else {
    track = (
      <Carousel.Track label={`Profils d'influenceurs : ${label}`} id="top-profiles" labelledBy={`tab-${filter}`}>
        {items.map((influencer) => <InfluencerCard key={influencer.id} influencer={influencer} v2={v2} />)}
      </Carousel.Track>
    );
  }

  return (
    <section className="section">
      <div className="wrap">
        <Carousel resetKey={filter}>
          <div className="row between" style={{ alignItems: 'flex-end' }}>
            <div>
              <h2>Les profils les mieux notés</h2>
              <p className="muted" style={{ margin: 0 }}>Classés par Score PULLUP : engagement réel, authenticité, respect des briefs et des délais.</p>
            </div>
            <Carousel.Arrows previousLabel="Profils précédents" nextLabel="Profils suivants" />
          </div>
          <div className="choice" style={{ marginTop: 18 }} role="tablist" aria-label="Filtrer les profils">
            {filters.map(([key, text]) => (
              <Chip
                key={key}
                id={`tab-${key}`}
                role="tab"
                aria-controls="top-profiles"
                selected={filter === key}
                onClick={() => setFilter(key)}
              >
                {text}
              </Chip>
            ))}
          </div>
          {track}
          <Carousel.Status />
        </Carousel>
      </div>
    </section>
  );
}

export function HomePage() {
  const flags = useFlags();
  const { role } = useSession();
  const { data: directory } = useDirectory();
  const { word, phase } = useRotatingWord(ROT_WORDS);

  return (
    <>
      <section className="hero">
        <Orbs />
        <Floaters />
        <div className="wrap">
          <div>
            <h1>
              Achetez de la visibilité auprès
              <span className="rot-line">
                <span className={phase === 'idle' ? 'rot' : `rot ${phase}`} aria-live="off">{word}</span>
              </span>
            </h1>
            <p className="lead">PULLUP réunit les créateurs de contenu ivoiriens et les marques qui veulent toucher leur audience. Tarifs affichés, paiement sécurisé, résultats mesurés.</p>
            <div className="ctas">
              <Link className="btn light" to={flags.v3 ? '/matching' : '/influenceurs'}>
                {flags.v3 ? 'Trouver mon influenceur avec l\'IA' : 'Trouver un influenceur'}
              </Link>
              <Link className="btn ghost" style={GHOST_LIGHT} to="/rejoindre">Créer ma vitrine d'influenceur</Link>
            </div>
            <div className="glass">
              <div><b>{directory ? formatCompact(directory.followers) : '…'}</b>abonnés cumulés</div>
              <div><b>{directory ? directory.verified : '…'}</b>profils vérifiés</div>
              <div><b>dès 5 000 FCFA</b>la première campagne</div>
            </div>
          </div>
          <div className="hero-card-slot">
            {directory?.featured ? <VitrineCard influencer={directory.featured} v2={flags.v2} cta /> : <Skeleton height={420} />}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2>Comment ça marche</h2>
          <p className="muted" style={{ maxWidth: '60ch' }}>Quatre étapes, de la recherche du bon profil à la mesure des résultats. Votre argent reste bloqué chez PULLUP tant que la publication n'est pas validée.</p>
          <ol className="steps" style={{ padding: 0 }}>
            <li>
              <h3 className="h4">Trouver le bon profil</h3>
              <p>Filtrez par thématique, réseau, audience et budget{flags.v3 ? ', ou laissez l\'IA vous proposer les meilleurs profils' : ''}.</p>
            </li>
            <li>
              <h3 className="h4">Rédiger le brief</h3>
              <p>Décrivez la publication, joignez vos visuels et votre lien de destination.</p>
            </li>
            <li>
              <h3 className="h4">{flags.v2 ? 'Payer en séquestre' : 'Contacter l\'influenceur'}</h3>
              <p>{flags.v2 ? 'Mobile money ou carte. L\'influenceur est payé seulement après validation de la publication.' : 'Envoyez une demande de devis directement depuis sa vitrine.'}</p>
            </li>
            <li>
              <h3 className="h4">Mesurer l'impact</h3>
              <p>Vues, engagement, clics de vos liens UTM : chaque franc dépensé est suivi.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="section tight">
        <div className="wrap">
          <h2>Mettez dans le mille</h2>
          <p className="muted">Choisissez l'univers qui parle à vos clients.</p>
          <div className="cats">
            {Object.entries(CATS).map(([key, cat]) => (
              <Link key={key} className="cat" to={`/influenceurs?cat=${key}`}>
                <span className="em" aria-hidden="true">{cat.e}</span>{cat.l}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <TopProfiles role={role} v2={flags.v2} />

      <section className="section tight">
        <div className="wrap">
          <div className="band">
            <img src={creatorPhoto} alt="Un créateur de contenu filme une vidéo devant son anneau lumineux" loading="lazy" decoding="async" />
            <div className="txt">
              <h2 style={{ color: '#fff' }}>Vous créez du contenu ? Faites-en un métier.</h2>
              <p style={{ opacity: 0.9 }}>Créez votre vitrine gratuite, affichez vos tarifs et recevez des campagnes déjà payées. L'argent est garanti par PULLUP avant même que vous publiiez.</p>
              <div className="row">
                <Link className="btn light" to="/rejoindre">Créer ma vitrine</Link>
                <Link className="btn ghost" style={GHOST_LIGHT} to="/faq">Comment ça marche</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--surface)', borderBlock: '1px solid var(--line)' }}>
        <div className="wrap">
          <h2>Pourquoi les marques choisissent PULLUP</h2>
          <div className="feat">
            {FEATURES.map(([icon, title, text]) => (
              <div key={title}>
                <h3 className="h4"><Icon name={icon} />{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2>Présents sur les 4 réseaux qui comptent</h2>
          <KpiGrid style={{ marginTop: 20 }}>
            {Object.entries(NET).map(([key, net]) => (
              <Kpi
                key={key}
                top={<span className="net" style={{ color: 'var(--ink)' }}><Icon name={key} />{net.l}</span>}
                value={directory ? directory.perNetwork[key] : '…'}
                label="influenceurs vérifiés"
              />
            ))}
          </KpiGrid>
        </div>
      </section>

      <section className="section tight">
        <div className="wrap">
          <h2>Une plateforme qui grandit avec vous</h2>
          <p className="muted" style={{ maxWidth: '62ch' }}>PULLUP se déploie en trois temps. Chaque version s'appuie sur la communauté construite par la précédente.</p>
          <div className="roadmap">
            <RoadmapItem version="V1" title="Vitrine influenceur" on items={['Page publique avec tarifs et QR code', 'Statistiques d\'audience et de visites', 'Demandes de devis et partenariats']} />
            <RoadmapItem version="V2" title="Engagement & séquestre" on={flags.v2} items={['Réservation et paiement en ligne', 'Fonds bloqués jusqu\'à la preuve de publication', 'Portefeuille et retraits mobile money']} />
            <RoadmapItem version="V3" title="Matching par IA" on={flags.v3} items={['Score de compatibilité marque × influenceur', 'Prédiction de portée et d\'engagement', 'Analyse IA du brief et recommandations']} />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap" style={{ maxWidth: 820 }}>
          <h2>Questions fréquentes</h2>
          <FaqList items={BRAND_FAQ.slice(0, 5)} />
          <p style={{ marginTop: 18 }}><Link to="/faq">Toutes les questions</Link></p>
        </div>
      </section>
    </>
  );
}
