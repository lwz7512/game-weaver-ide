import { useState } from 'react';
import { TabId } from '@blueprintjs/core';

const useTabsBar = () => {
  const [navbarTabId, setNavbarTabId] = useState<TabId>('main');
  const handleNavbarTabChange = (tabId: TabId) => setNavbarTabId(tabId);

  return {
    navbarTabId,
    handleNavbarTabChange,
  };
};

export default useTabsBar;
