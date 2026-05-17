import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './badge';

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>Activo</Badge>);
    expect(screen.getByText('Activo')).toBeDefined();
  });

  it('renders with default variant without crashing', () => {
    const { container } = render(<Badge>default</Badge>);
    expect(container.firstChild).toBeDefined();
  });

  it('renders with success variant', () => {
    render(<Badge variant="success">Completada</Badge>);
    expect(screen.getByText('Completada')).toBeDefined();
  });

  it('renders with danger variant', () => {
    render(<Badge variant="danger">Cancelada</Badge>);
    expect(screen.getByText('Cancelada')).toBeDefined();
  });

  it('renders with muted variant', () => {
    render(<Badge variant="muted">Inactivo</Badge>);
    expect(screen.getByText('Inactivo')).toBeDefined();
  });

  it('includes custom className in the element', () => {
    const { container } = render(<Badge className="test-cls">Label</Badge>);
    expect((container.firstChild as HTMLElement).className).toContain('test-cls');
  });
});
