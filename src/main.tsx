import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@styles/index.css'
import { RouterProvider } from 'react-router'
import ControlContextProvider from './context/ControlContexProvider'
import { routes } from './router/routes'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ControlContextProvider>
      <RouterProvider router={routes}/>
    </ControlContextProvider>
  </StrictMode>,
)
