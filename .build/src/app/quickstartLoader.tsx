import {ProcQuickStartParser} from "@app/procedure-parser";

const loadJSONQuickStartsFilesFromAssets = async (basePath: string): Promise<string[]> => {
    const data = await fetch(`${basePath}/webpack-assets.json`).then(response => response.json());
    const files = Array.isArray(data[""]["json"]) ? data[""]["json"] : [data[""]["json"]];
    return files.filter(url => url.endsWith(".quickstart.json"));
}

export const loadJSONQuickStarts = async(basePath: string) => {
    const files = await loadJSONQuickStartsFilesFromAssets(basePath);
    const result = [] as any[];
    for (let i = 0; i < files.length; i++) {
        await fetch(files[i]).then(response => response.json().then(data => result.push(data)));
    }
    return result.map(content => ProcQuickStartParser(content));
}
