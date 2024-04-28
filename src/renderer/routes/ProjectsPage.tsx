import { Layout } from './Layout';
import {
  ChalllengeItem,
  ChallengeInstructions,
  ChallengeContentHeader,
} from '../components/ChallengeModules';
import { ROUTES, CHALLENGE_AWARD_SLOGAN } from '../config';
import { useProjectsPage } from '../controllers/useProjectsPage';

/**
 * Coding Challenges Module
 *
 * @2023/09/20
 *
 * @returns
 */
const ProjectsPage = () => {
  const { challenges, openChallenge } = useProjectsPage();

  return (
    <Layout
      pageName="challenges"
      modulePath={ROUTES.PROJECTS}
      sidePanel={
        <div className="file-explorer bg-sky-800 w-60 overflow-y-scroll">
          <h1 className=" text-lg bg-slate-600 m-0 p-4 text-white text-center">
            Challenge Explorer
          </h1>
          {/* loading indicator.. */}
          {challenges.length === 0 && (
            <p className="text-base p-2 text-white">Loading Challenges...</p>
          )}
          {/* === Challenge List === */}
          <ul className=" text-sm list-none text-gray-800 leading-7">
            {challenges.map((clg) => (
              <ChalllengeItem
                key={clg.name}
                doc={clg}
                docLoadHandler={openChallenge}
              />
            ))}
          </ul>
        </div>
      }
    >
      {/* === right part content === */}
      <div className="project-content flex-1 bg-white overflow-y-scroll">
        <ChallengeContentHeader isChallengeOpen={false} />
        {/* fixed right menu */}
        {/* <SideFixeModules sectionScrollHander={scrollToChallengeSection} /> */}
        <h2 className="m-12 mt-36 p-4 text-slate-700 text-xl border-l-8 border-green-600 bg-gray-100 rounded-r-lg">
          {CHALLENGE_AWARD_SLOGAN}
        </h2>
        <ChallengeInstructions challengeLoaded={false} />
      </div>
      {/* floating webview ...use shell to open browser instead - 2023/10/02 */}
      {/* <WebDocViewer /> */}
    </Layout>
  );
};

export default ProjectsPage;
