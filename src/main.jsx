import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// StrictMode intentionally omitted: Chart.js canvas context breaks
// when React double-invokes effects in dev strict mode.
createRoot(document.getElementById('root')).render(<App />)
