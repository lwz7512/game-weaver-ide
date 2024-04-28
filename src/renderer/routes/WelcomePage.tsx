/**
 * Created @2022/08/19
 *
 * - Added refactered `useHTTPServer` to detect workspace existance @2022/09/30
 */
import { toast } from 'react-toastify';
import {
  ROUTES,
  WORKSPACE_GONE_WARNING as WG,
  WORKSPACE_UNDEFINED as WU,
} from '../config';
import { HeroBanner } from '../components/HeroBanner';
import useLeftSideBar from '../hooks/useLeftSideBar';
import { useHTTPServer } from '../hooks/useHTTPServer';
import { useChallengeRecords } from '../hooks/useChallengeRecords';

import placeHolderImg from '../assets/global-preloader.jpg';
import appCfg from '../assets/app.json';

import { Layout } from './Layout';

const WelcomePage = () => {
  const { gotoChallengePage } = useLeftSideBar();
  const checkGoneHandler = () => toast.error(WG);
  const saySomething = () => toast.warn(WU);

  useHTTPServer(checkGoneHandler, saySomething);

  const { challenges } = useChallengeRecords();

  return (
    <Layout pageName="welcome" modulePath={ROUTES.WELCOME}>
      <div className="flex-1">
        <HeroBanner
          slogan={appCfg.slogan}
          title={appCfg.heroTitle}
          heroURL={appCfg.baseURL + appCfg.heroImage}
          placeHolder={placeHolderImg}
        />
        <div className="four-section-grid grid grid-cols-3 grid-rows-2">
          <div className="section">
            <h2 className="text-lg font-semibold">New...</h2>
            <ul className="py-4 px-4 text-gray-200 text-sm leading-6">
              <li className="home-card-item">New Game (save to local)...</li>
              <li className="home-card-item">New Code Example ...</li>
              <li className="home-card-item">New Tutorial ...</li>
              <li className="home-card-item">New Project ...</li>
            </ul>
          </div>
          <div className="section">
            <h2 className="text-lg font-semibold">Recent Challenge</h2>
            <ul className="py-4 px-4 text-gray-200 text-sm leading-6">
              {challenges.map((clg) => (
                <li className="home-card-item" key={clg.id}>
                  <button
                    type="button"
                    className=""
                    onClick={() => gotoChallengePage(clg.id)}
                  >
                    {clg.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="section right-cell">
            <h2 className="text-lg font-semibold">Tutorials</h2>
          </div>
          <div className="section">
            <h2 className="text-lg font-semibold">Samples</h2>
          </div>
          <div className="section">
            <h2 className="text-lg font-semibold">My Projects</h2>
          </div>
          <div className="section right-cell">
            <h2 className="text-lg font-semibold">Updates</h2>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WelcomePage;
