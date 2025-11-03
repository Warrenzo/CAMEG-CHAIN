import { render, screen } from '@testing-library/react';
import App from './App';

test('renders CAMEG-CHAIN app', () => {
  render(<App />);
  const linkElement = screen.getByText(/CAMEG-CHAIN/i);
  expect(linkElement).toBeInTheDocument();
});
