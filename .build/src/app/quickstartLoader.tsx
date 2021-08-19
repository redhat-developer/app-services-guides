import { GuidesQuickStart, ProcQuickStartParser } from "@app/procedure-parser";
import React, { useState, useEffect, FunctionComponent } from "react";
import { useAssets } from "@bf2/ui-shared";
import { QuickStart } from "@patternfly/quickstarts";

const loadJSONQuickStartsFilesFromAssets = async (
  basePath: string
): Promise<string[]> => {
  const data = await fetch(`${basePath}/webpack-assets.json`).then((response) =>
    response.json()
  );
  const files = Array.isArray(data[""]["json"])
    ? data[""]["json"]
    : [data[""]["json"]];
  return files
    .filter((url) => url.endsWith(".quickstart.json"))
    .map((e) => (!e.startsWith("http") ? `${basePath}/${e}` : e));
};

export const loadJSONQuickStarts = async (
  basePath: string,
  showDrafts?: boolean
) => {
  const files = await loadJSONQuickStartsFilesFromAssets(basePath);
  const result = [] as GuidesQuickStart[];
  for (let i = 0; i < files.length; i++) {
    await fetch(files[i]).then((response) =>
      response.json().then((data) => result.push(data))
    );
  }
  return result
    .filter((qs) => {
      if (!showDrafts && qs.metadata.annotations?.draft) {
        return false;
      }
      return true;
    })
    .map((content) => ProcQuickStartParser(content));
};

export interface QuickStartLoaderProps {
  children: React.ReactNode;
  showDrafts?: boolean;
  onLoad: (quickStarts: QuickStart[]) => {};
}

const QuickStartLoader: FunctionComponent = ({ showDrafts, onLoad }) => {
  const [loaded, setLoaded] = useState(false);
  const assets = useAssets();
  useEffect(() => {
    if (loaded) {
        console.log('already loaded guides');
        return null;
    }
    const load = async () => {
      const quickstarts = await loadJSONQuickStarts(
        assets?.getPath() || "",
        showDrafts
      );
      onLoad(quickstarts);
      setLoaded(true);
    };
    // simulate wait
    setTimeout(() => {
        console.log(`guides: loading`);
        load();
    }, 3000);
  }, [assets, showDrafts]);
  return null;
};

export default QuickStartLoader;
