import { useState, useCallback } from 'react'
import { AppStoreProvider, useApp } from './store/AppStore'
import { TopBar } from './components/layout/TopBar'
import { BottomNav } from './components/nav/BottomNav'
import { Toast } from './components/ui/Toast'
import { HomeScreen } from './screens/HomeScreen'
import { GeneratorScreen } from './screens/GeneratorScreen'
import { VideosScreen } from './screens/VideosScreen'
import { ToxScreen } from './screens/ToxScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { StudioScreen } from './screens/StudioScreen'
import { useProjects } from './hooks/useProjects'
import { missingConfig } from './config'

export default function App() {
  return (
    <AppStoreProvider>
      <Shell />
    </AppStoreProvider>
  )
}

function Shell() {
  const { tab, setTab, studioUnlocked } = useApp()
  const { projects, addProject, removeProject } = useProjects()
  const [toast, setToast] = useState(null)
  const missing = missingConfig()

  const showToast = useCallback((message, type = 'info') => setToast({ message, type }), [])
  const go = useCallback((t) => setTab(t), [setTab])

  const screenProps = { showToast, go, projects, addProject, removeProject }

  // Studio nur wenn entsperrt — sonst Fallback Home
  const active = tab === 'studio' && !studioUnlocked ? 'home' : tab

  return (
    <div className="app">
      <TopBar />

      <main className="main">
        {missing.length > 0 && (
          <div className="banner" style={{ marginBottom: 16 }}>
            ⚙️ Konfiguration fehlt: {missing.join(', ')} — in <b>.env.local</b> eintragen und neu starten.
          </div>
        )}

        {active === 'home' && <HomeScreen {...screenProps} />}
        {active === 'generator' && <GeneratorScreen {...screenProps} />}
        {active === 'videos' && <VideosScreen {...screenProps} />}
        {active === 'tox' && <ToxScreen {...screenProps} />}
        {active === 'profil' && <ProfileScreen {...screenProps} />}
        {active === 'studio' && <StudioScreen {...screenProps} />}
      </main>

      <BottomNav />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
