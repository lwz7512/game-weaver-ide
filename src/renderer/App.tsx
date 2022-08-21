import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';

import WelcomePage from './routes/WelcomePage';
import CodeEditorPage from './routes/CodeEditorPage';
import { ROUTES } from './config';

import './App.css';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path={ROUTES.WELCOME} element={<WelcomePage />} />
        <Route path={ROUTES.CODE} element={<CodeEditorPage />} />
      </Routes>
    </Router>
  );
}
