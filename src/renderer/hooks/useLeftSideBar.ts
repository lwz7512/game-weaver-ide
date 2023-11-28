import { useNavigate } from 'react-router-dom';
import { MODULEROUTES, ROUTES } from '../config';

const useLeftSideBar = () => {
  const navigate = useNavigate();

  const onModuleChanged = (module: string) => {
    // console.log(module);
    navigate(MODULEROUTES[module]);
  };

  const gotoChallengePage = (challengeId: number) => {
    const challengeRoute = ROUTES.PROJECTS;
    const target = {
      pathname: challengeRoute,
      search: `?challengeId=${challengeId}`,
    };
    navigate(target);
  };

  return {
    onModuleChanged,
    gotoChallengePage,
  };
};

export default useLeftSideBar;
