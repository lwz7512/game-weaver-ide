/**
 * Open source javascript games
 * @date 2024/04/27
 */

import { ROUTES } from '../config';
import { Layout } from './Layout';

const OSGamePage = () => {
  return (
    <Layout
      pageName="games"
      modulePath={ROUTES.GAMES}
      sidePanel={
        <div className="file-explorer bg-gray-300 w-60 p-2">Game Explorer</div>
      }
    >
      {/* right part */}
      <div className="flex-1 bg-white">
        <h1 className="text-lg text-center p-8 border-b-2 mb-8 font-semibold text-slate-600 bg-slate-50">
          Welcome to Open source Javascript Games Center!
        </h1>
        <div className="px-4">
          <p>comming soon...</p>
        </div>
      </div>
    </Layout>
  );
};

export default OSGamePage;
