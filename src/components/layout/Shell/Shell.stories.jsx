import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Shell } from './Shell.jsx';

function Demo() {
  return (
    <MemoryRouter initialEntries={['/influenceurs']}>
      <Routes>
        <Route
          element={(
            <Shell
              brand={<strong>pullup</strong>}
              navLabel="Principal"
              skipLabel="Aller au contenu"
              items={[{ to: '/influenceurs', label: 'Influenceurs' }]}
              tabs={[{ to: '/influenceurs', label: 'Explorer' }]}
            />
          )}
        >
          <Route path="/influenceurs" element={<p className="wrap">Contenu</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

/** @type {import('@storybook/react-vite').Meta<typeof Demo>} */
const meta = { title: 'Layout/Shell', component: Demo };
export default meta;
export const Cadre = {};
