import { Carousel } from './Carousel.jsx';

/** @type {import('@storybook/react-vite').Meta<typeof Carousel>} */
const meta = {
  title: 'UI/Carousel',
  component: Carousel,
  tags: ['autodocs'],
};

export default meta;

const slides = Array.from({ length: 8 }, (_, k) => `Profil ${k + 1}`);

export const Defaut = {
  render: () => (
    <Carousel>
      <div className="row between">
        <h3 style={{ margin: 0 }}>Les profils les mieux notés</h3>
        <Carousel.Arrows previousLabel="Profils précédents" nextLabel="Profils suivants" />
      </div>
      <Carousel.Track label="Profils d'influenceurs">
        {slides.map((slide) => <article key={slide} className="icard"><b>{slide}</b></article>)}
      </Carousel.Track>
      <Carousel.Status />
    </Carousel>
  ),
};
