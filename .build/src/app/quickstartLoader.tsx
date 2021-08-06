import {GuidesQuickStart, ProcQuickStartParser} from "@app/procedure-parser";

const loadJSONQuickStartsFilesFromAssets = async (basePath: string): Promise<string[]> => {
    const data = await fetch(`${basePath}/webpack-assets.json`).then(response => response.json());
    const files = Array.isArray(data[""]["json"]) ? data[""]["json"] : [data[""]["json"]];
    return files.filter(url => url.endsWith(".quickstart.json")).map(e => !e.startsWith("http") ? `${basePath}/${e}`: e);
}

export const loadJSONQuickStarts = async(basePath: string, showDrafts?: boolean) => {
    const files = await loadJSONQuickStartsFilesFromAssets(basePath);
    const result = [] as GuidesQuickStart[];
    for (let i = 0; i < files.length; i++) {
        await fetch(files[i]).then(response => response.json().then(data => result.push(data)));
    }
    return result.filter(qs => {
        if (!showDrafts && qs.metadata.annotations?.draft) {
            return false;
        }
        return true;
    }).map(content => ProcQuickStartParser(content));
}
