import { describe, expect, it } from 'vitest';
import {
  createCatalogItem,
  getAdminCatalog,
  getPublicCatalog,
  hideCatalogItem,
  toCatalogCreateBody,
  toCatalogUpdateBody,
  updateCatalogItem,
} from './catalog.service.js';

describe('catalogue admin via l’API', () => {
  it('construit les corps OpenAPI', () => {
    expect(toCatalogCreateBody({ kind: 'category', key: ' Cinema ', label: ' Cinéma & séries ', related: ['actu', 'humour'] })).toEqual({
      kind: 'category', key: 'cinema', label: 'Cinéma & séries', related: ['actu', 'humour'],
    });
    expect(toCatalogCreateBody({ kind: 'city', key: '', label: 'Man', related: ['x'] })).toEqual({ kind: 'city', label: 'Man' });
    expect(toCatalogCreateBody({ kind: 'objective', label: 'Fidélisation', reco: 'Programmes ambassadeurs' })).toEqual({
      kind: 'objective', label: 'Fidélisation', reco: 'Programmes ambassadeurs',
    });
    expect(toCatalogUpdateBody('category', { label: 'Cinéma, séries & streaming', related: ['actu'], reco: 'x', active: true })).toEqual({
      label: 'Cinéma, séries & streaming', related: ['actu'], active: true,
    });
    expect(toCatalogUpdateBody('city', { active: true })).toEqual({ active: true });
  });

  it('GET /catalog alimente les listes publiques', async () => {
    const catalog = await getPublicCatalog();
    expect(catalog.cats.beaute).toEqual({ l: 'Mode & beauté', e: '💄' });
    expect(catalog.cities).toEqual(['Abidjan', 'Bouaké']);
    expect(catalog.objectives.notoriete).toBe('Notoriété');
    expect(catalog.contactTypes).toContain('Partenariat');
  });

  it('GET /admin/catalog regroupe et inclut les masqués', async () => {
    const catalog = await getAdminCatalog();
    expect(catalog.categories.map((c) => c.key)).toEqual(['humour', 'beaute', 'cinema']);
    expect(catalog.categories[2].active).toBe(false);
    expect(catalog.objectives[0].reco).toBe('Campagnes de notoriété');
    expect(catalog.contactTypes[0].related).toEqual([]);
  });

  it('POST, PUT et DELETE /admin/catalog', async () => {
    const created = await createCatalogItem({ kind: 'category', key: 'cinema', label: 'Cinéma & séries', related: ['actu', 'humour'] });
    expect(created.message).toBe('Catégorie créée.');
    expect(created.item.related).toEqual(['actu', 'humour']);
    await expect(createCatalogItem({ kind: 'category', key: 'beaute', label: 'Mode' })).rejects.toThrow('Cette clé existe déjà.');
    await expect(createCatalogItem({ kind: 'category', label: 'x' })).rejects.toThrow('Indiquez un libellé.');

    const updated = await updateCatalogItem('category', 'cinema', { label: 'Cinéma, séries & streaming', active: true });
    expect(updated.item.label).toBe('Cinéma, séries & streaming');

    const hidden = await hideCatalogItem('category', 'cinema');
    expect(hidden).toMatchObject({ message: 'Catégorie masquée.', item: { active: false } });
    await expect(hideCatalogItem('city', 'Abidjan')).rejects.toThrow('Gardez au moins un élément actif.');
  });
});
