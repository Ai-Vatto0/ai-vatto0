import React, { useState, useEffect } from 'react';
import './MenuWall.css';

type ScreenPosition = 'left' | 'center' | 'right';

interface ScreenData {
  position: ScreenPosition;
  title: string;
  imageBase64?: string;
  lastUpdated?: string;
}

const MenuWallApp: React.FC = () => {
  const [screens, setScreens] = useState<Record<ScreenPosition, ScreenData>>({
    left: { position: 'left', title: 'Baguettes / Tacos' },
    center: { position: 'center', title: 'Bowls / Menüs' },
    right: { position: 'right', title: 'Angebote / Getränke' },
  });

  const [adminMode, setAdminMode] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState<ScreenPosition>('left');

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('menuWallData');
    if (stored) {
      try {
        setScreens(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load data:', e);
      }
    }
  }, []);

  // Save to localStorage whenever screens change
  useEffect(() => {
    localStorage.setItem('menuWallData', JSON.stringify(screens));
  }, [screens]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setScreens((prev) => ({
        ...prev,
        [selectedScreen]: {
          ...prev[selectedScreen],
          imageBase64: base64,
          lastUpdated: new Date().toLocaleString(),
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleTitleChange = (position: ScreenPosition, title: string) => {
    setScreens((prev) => ({
      ...prev,
      [position]: {
        ...prev[position],
        title,
        lastUpdated: new Date().toLocaleString(),
      },
    }));
  };

  const handleClearImage = (position: ScreenPosition) => {
    setScreens((prev) => ({
      ...prev,
      [position]: {
        ...prev[position],
        imageBase64: undefined,
      },
    }));
  };

  const displayMode = !adminMode ? (
    <div className="menu-wall-display">
      {(['left', 'center', 'right'] as ScreenPosition[]).map((pos) => (
        <div key={pos} className={`screen-segment ${pos}`}>
          {screens[pos].imageBase64 ? (
            <img
              src={screens[pos].imageBase64}
              alt={screens[pos].title}
              className="screen-image"
            />
          ) : (
            <div className="screen-placeholder">
              <h2>{screens[pos].title}</h2>
              <p>Kein Bild vorhanden</p>
            </div>
          )}
        </div>
      ))}
    </div>
  ) : (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>📺 Menü-Wall Admin Panel</h1>
        <button onClick={() => setAdminMode(false)} className="btn-close">
          ✕ Schließen
        </button>
      </div>

      <div className="admin-controls">
        <div className="screen-selector">
          <h3>Bildschirm wählen:</h3>
          <div className="btn-group">
            {(['left', 'center', 'right'] as ScreenPosition[]).map((pos) => (
              <button
                key={pos}
                className={`btn-screen ${selectedScreen === pos ? 'active' : ''}`}
                onClick={() => setSelectedScreen(pos)}
              >
                {pos === 'left' ? '◀ Links' : pos === 'center' ? '● Mitte' : '▶ Rechts'}
              </button>
            ))}
          </div>
        </div>

        <div className="control-group">
          <label>
            Titel für {selectedScreen === 'left' ? 'Linken' : selectedScreen === 'center' ? 'Mittleren' : 'Rechten'} Screen:
          </label>
          <input
            type="text"
            value={screens[selectedScreen].title}
            onChange={(e) => handleTitleChange(selectedScreen, e.target.value)}
            className="input-title"
            placeholder="Z.B. Baguettes / Tacos"
          />
        </div>

        <div className="control-group">
          <label>Menü-Bild hochladen ({selectedScreen === 'left' ? 'LINKS' : selectedScreen === 'center' ? 'MITTE' : 'RECHTS'}):</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="input-file"
          />
          {screens[selectedScreen].imageBase64 && (
            <>
              <p className="last-updated">
                Aktualisiert: {screens[selectedScreen].lastUpdated}
              </p>
              <button
                onClick={() => handleClearImage(selectedScreen)}
                className="btn-danger"
              >
                🗑️ Bild löschen
              </button>
            </>
          )}
        </div>

        <div className="preview-group">
          <h3>Vorschau - {selectedScreen === 'left' ? 'LINKER' : selectedScreen === 'center' ? 'MITTLERER' : 'RECHTER'} Screen:</h3>
          <div className="preview-box">
            {screens[selectedScreen].imageBase64 ? (
              <img src={screens[selectedScreen].imageBase64} alt="Vorschau" />
            ) : (
              <div className="preview-placeholder">Kein Bild</div>
            )}
          </div>
        </div>
      </div>

      <div className="admin-info">
        <p>💾 Alle Änderungen werden automatisch gespeichert.</p>
        <p>🔄 Die Sticks zeigen die Menü-Wand automatisch nach Neustart an.</p>
      </div>
    </div>
  );

  return (
    <div className="menu-wall-app">
      {displayMode}
      <button
        onClick={() => setAdminMode(!adminMode)}
        className="btn-admin-toggle"
      >
        {adminMode ? '👁️ Anzeigen' : '⚙️ Admin'}
      </button>
    </div>
  );
};

export default MenuWallApp;
