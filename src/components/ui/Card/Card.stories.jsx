import { Card } from './Card.jsx';

function Demo() {
  return (
    <Card>
      <Card.Header><h2>Ama Kouassi</h2></Card.Header>
      <Card.Body><p>Mode & beauté · Abidjan</p></Card.Body>
      <Card.Footer><span className="pill p-ok">Vérifiée</span></Card.Footer>
    </Card>
  );
}

/** @type {import('@storybook/react-vite').Meta<typeof Demo>} */
const meta = { title: 'UI/Card', component: Demo, tags: ['autodocs'] };
export default meta;
export const Profil = {};
