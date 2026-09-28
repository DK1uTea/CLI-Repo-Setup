import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import DashboardMain from '@/features/dashboard/(components)/dashboard-main';

describe('DashboardMain', () => {
  it('renders starter dashboard overview with tech stack badges', () => {
    render(<DashboardMain />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Dashboard Overview');
    expect(screen.getByText('Starter Base')).toBeInTheDocument();
    expect(screen.getByText('Next.js 16')).toBeInTheDocument();
    expect(screen.getByText('Tailwind v4')).toBeInTheDocument();
    expect(screen.getAllByText('AGENTS.md').length).toBeGreaterThan(0);
    expect(screen.getByText('Vitest + E2E')).toBeInTheDocument();
  });
});
