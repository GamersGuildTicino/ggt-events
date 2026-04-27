import { useEffect } from "react";

//------------------------------------------------------------------------------
// Page Title
//------------------------------------------------------------------------------

const appName = "Gamers Guild Ticino";

//------------------------------------------------------------------------------
// Use Page Title
//------------------------------------------------------------------------------

export default function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${appName}` : appName;
  }, [title]);
}
