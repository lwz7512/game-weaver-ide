import LeftSideBar from '../components/LeftSideBar';
import { MODULETYPES } from '../config';
import useLeftSideBar from '../hooks/useLeftSideBar';

const UserPage = () => {
  const { onModuleChanged } = useLeftSideBar();

  return (
    <div className="w-full h-screen flex">
      <div className="left-sidepanel flex">
        <LeftSideBar
          activeModule={MODULETYPES.USER}
          onModuleChanged={onModuleChanged}
        />
        {/* <div className="file-explorer bg-gray-300 w-60 p-2">file explorer</div> */}
      </div>
      <div className="flex-1">
        <h1 className=" text-center p-8">Welcome to user page!</h1>
      </div>
    </div>
  );
};

export default UserPage;
