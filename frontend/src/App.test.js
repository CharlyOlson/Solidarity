import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Solidarity app title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Solidarity/i);
  expect(titleElement).toBeInTheDocument();
});
