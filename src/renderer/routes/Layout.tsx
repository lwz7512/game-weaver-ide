import { ToastContainer } from 'react-toastify';

import LeftSideBar from '../components/LeftSideBar';
import useLeftSideBar from '../hooks/useLeftSideBar';

type LayoutProps = {
  pageName: string;
  modulePath: string;
  showSideBar?: boolean;
  sidePanel?: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Common Component for all the page
 * @param param0
 * @returns
 */
export const Layout = ({
  pageName = 'root',
  showSideBar = true,
  modulePath,
  sidePanel,
  children,
}: LayoutProps) => {
  const { onModuleChanged } = useLeftSideBar();

  return (
    <div className={`${pageName}-page w-full h-screen flex`}>
      <div className="left-sidepanel flex">
        {showSideBar && (
          <LeftSideBar
            activeModule={modulePath}
            onModuleChanged={onModuleChanged}
          />
        )}
        {/* side panel.. */}
        {sidePanel}
      </div>
      {/* <hr style={navbarStyle(pathname)} /> */}
      {/* == Children Here: == */}
      {children}
      <ToastContainer theme="dark" autoClose={6000} />
    </div>
  );
};
