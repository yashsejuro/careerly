import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { ChartContainer, ChartStyle, ChartConfig } from './chart';
import { describe, it, expect, afterEach } from 'vitest';

describe('ChartStyle Security', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders styles correctly', () => {
    const config: ChartConfig = {
      test: { color: 'red' },
    };
    const { container } = render(<ChartStyle id="test-id" config={config} />);

    // We expect the style tag to contain the CSS
    const style = container.querySelector('style');
    expect(style).not.toBeNull();
    expect(style?.innerHTML).toContain('[data-chart=test-id]');
    expect(style?.innerHTML).toContain('--color-test: red');
  });

  it('prevents XSS via id by escaping style tag', () => {
    const config: ChartConfig = {
      test: { color: 'red' },
    };
    const maliciousId = 'test-id"] {} </style><script>alert(1)</script><style> [data-chart="';

    const { container } = render(<ChartStyle id={maliciousId} config={config} />);

    const style = container.querySelector('style');
    // It should not contain the unescaped closing style tag
    expect(style?.innerHTML).not.toContain('</style><script>alert(1)</script>');
    // It should contain the escaped version which doesn't close the tag
    expect(style?.innerHTML).toContain('<\\/style><script>alert(1)</script>');
  });

  it('prevents XSS via color config by escaping style tag', () => {
     const config: ChartConfig = {
      test: { color: 'red; } </style><div id="injected"></div><style> {' },
    };

    const { container } = render(<ChartStyle id="test-id" config={config} />);

    const style = container.querySelector('style');
    expect(style?.innerHTML).not.toContain('</style><div id="injected"></div>');
    expect(style?.innerHTML).toContain('<\\/style><div id="injected"></div>');
  });
});
