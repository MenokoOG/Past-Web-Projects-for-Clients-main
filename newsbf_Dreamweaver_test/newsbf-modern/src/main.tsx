import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { record } from './droid/log'
import { LEDGER } from './droid/ledger'
import { PROVIDERS } from './news/registry'

const container = document.getElementById('root')
if (!container) throw new Error('Root container is missing from index.html')

record({
  kind: 'handshake',
  headline: 'NB-3O online. Modernization protocols loaded.',
  detail: `${LEDGER.length} findings held from the 2012 Dreamweaver build. Fluent in ${PROVIDERS.length} news protocols, ${
    PROVIDERS.filter((provider) => provider.keyless).length
  } of which need no API key.`,
})

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
