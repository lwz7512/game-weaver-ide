import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';

import WelcomePage from './routes/WelcomePage';
import CodeEditorPage from './routes/CodeEditorPage';
import CodeBlocksPage from './routes/CodeBlocksPage';
import LearningPage from './routes/LearningPage';
import ProjectsPage from './routes/ProjectsPage';
import ChallengePage from './routes/ChallengePage';
import SettingsPage from './routes/SettingsPage';
import TiledEditorPage from './routes/TileEditorPage';
import UserPage from './routes/UserPage';
import { ROUTES } from './config';

import './App.css';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path={ROUTES.WELCOME} element={<WelcomePage />} />
        <Route path={ROUTES.CODE} element={<CodeEditorPage />} />
        <Route path={ROUTES.BLOCKS} element={<CodeBlocksPage />} />
        <Route path={ROUTES.LEARN} element={<LearningPage />} />
        <Route path={ROUTES.PROJECTS} element={<ProjectsPage />} />
        <Route path={ROUTES.CHALLENGE} element={<ChallengePage />} />
        <Route path={ROUTES.SETTING} element={<SettingsPage />} />
        <Route path={ROUTES.TILED} element={<TiledEditorPage />} />
        <Route path={ROUTES.USER} element={<UserPage />} />
      </Routes>
    </Router>
  );
}
