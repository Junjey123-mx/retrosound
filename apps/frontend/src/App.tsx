import { Providers } from './providers';
import { AppRouter } from './router/app-router';

export function App() {
  return (
    <Providers>
      <AppRouter />
    </Providers>
  );
}
