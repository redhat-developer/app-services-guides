import {ProcedureAdocHtmlParser} from "@app/procedure-adoc-html-parser";

const loadQuickStartsFilesFromAssets = async (basePath: string): Promise<string[]> => {
    const data = await fetch(`${basePath}/webpack-assets.json`).then(response => response.json());
    const files = Array.isArray(data[""]["html"]) ? data[""]["html"] : [data[""]["html"]];
    return files.filter((url: string) => url.includes("generated/guides"));
}

export const loadQuickStarts = async(basePath: string) => {
    const files = await loadQuickStartsFilesFromAssets(basePath);
    const result = [] as string[];
    for (let i = 0; i < files.length; i++) {
        await fetch(files[i]).then(response => response.text().then(data => result.push(data)));
    }
    return result.map(content =>  ProcedureAdocHtmlParser(content, "abc-123"));
}
