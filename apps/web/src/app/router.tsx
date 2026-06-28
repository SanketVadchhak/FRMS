import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes';

export function Router() {
  return <RouterProvider router={router} />;
}
