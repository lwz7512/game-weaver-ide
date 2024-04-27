import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config';

const useLeftSideBar = () => {
  const navigate = useNavigate();

  const onModuleChanged = (modulePath: string) => {
    navigate(modulePath);
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
