import "~styles/globals.css";

import { Button } from "@/src/components/ui/button";

const IndexPopup = () => {
  const openOptionsPage = () => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <div className="p-5 font-sans w-72 space-y-4">
      <p className="text-gray-600 text-sm">
        An OpenAI API key is required to use this extension. Add your key in settings to get started.
      </p>
      <Button className="w-full" onClick={openOptionsPage}>
        Options
      </Button>
    </div>
  );
};

export default IndexPopup;
