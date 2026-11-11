import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Card } from './Card.jsx';

describe('Card', () => {
  it('compose l’en-tête et le corps', () => {
    render(
      <Card>
        <Card.Header><h2>Ama Kouassi</h2></Card.Header>
        <Card.Body><p>Abidjan</p></Card.Body>
      </Card>,
    );
    expect(screen.getByRole('heading', { name: 'Ama Kouassi' })).toBeInTheDocument();
    expect(screen.getByText('Abidjan')).toBeInTheDocument();
  });
});
