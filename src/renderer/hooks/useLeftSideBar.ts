import { useNavigate } from 'react-router-dom';
import { MODULEROUTES } from '../config';

const useLeftSideBar = () => {
  const navigate = useNavigate();

  const onModuleChanged = (module: string) => {
    // console.log(module);
    navigate(MODULEROUTES[module]);
  };

  return {
    onModuleChanged,
  };
};

export default useLeftSideBar;
