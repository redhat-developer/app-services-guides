import {QuickStart, QuickStartTask} from "@cloudmosaic/quickstarts";

export const ProcQuickStartParser = (
    quickStart: QuickStart & {
        spec: {
            tasks: undefined | QuickStartTask[] | string[]
        }
    },
    environmentVariables?: { [name: string]: string }
) => {
    const replaceEnvironmentVariables = (s: string | undefined) =>
        s?.replace(/\${(\w+)}/, (substring, name) => {
            return environmentVariables ? [name]
                ? environmentVariables[name]
                : substring : substring;
        });

    quickStart.spec.tasks = quickStart.spec.tasks?.map((task: QuickStartTask | string, index) => {
        let proc: string;
        let answer: QuickStartTask;
        if (typeof task === "string") {
            proc = task;
            answer = {};
        } else {
            proc = task["proc"]
            answer = task;
            delete task["proc"];
        }

        let description, procedure, verification, title, summaryFailed, success, reviewFailed: string | undefined;
        if (proc) {
            const taskDOM = document.createElement("div");
            taskDOM.innerHTML = proc;

            title = taskDOM.querySelector("h1:first-child,h2:first-child,h3:first-child,h4:first-child,h5:first-child")?.innerHTML.trim();
            let sectionBody = taskDOM.querySelector(".sectionbody");
            if (!sectionBody?.hasChildNodes()) {
                // possibly in other templates, where we want to look for article
                sectionBody = taskDOM.querySelector("article");
            }
            if (sectionBody) {
                for (let i = 0; i < sectionBody.children.length || 0; i++) {
                    const child = sectionBody.children.item(i);
                    // find the title
                    const title = child?.querySelector(".heading,.title");
                    if (title) {
                        switch (title?.textContent?.trim()) {
                            case "Procedure":
                                procedure = child?.querySelector(":not(.heading,.title)")?.outerHTML.trim();
                                break;
                            case "Verification":
                                verification = child?.querySelector(":not(.heading,.title)")?.outerHTML.trim();
                                break;
                        }
                    } else if (!procedure) {
                        // Otherwise if it comes before a procedure it's part of the description
                        description = child?.innerHTML.trim();
                    }
                }
            }
            success = taskDOM.querySelector(".qs-summary.success")?.innerHTML.trim();
            reviewFailed = taskDOM.querySelector(".qs-review.failed")?.innerHTML.trim();
            summaryFailed = taskDOM.querySelector(".qs-summary.failed")?.innerHTML.trim();
        }


        answer.title = replaceEnvironmentVariables(answer.title || title)
        answer.description = replaceEnvironmentVariables(answer.description || `${description} ${procedure}`);
        answer.review = answer.review || {};
        answer.review.instructions = replaceEnvironmentVariables(answer.review?.instructions || verification || "Have you completed these steps?")
        answer.review.failedTaskHelp = replaceEnvironmentVariables(answer.review.failedTaskHelp || reviewFailed || "This task isn’t verified yet. Try the task again.");
        answer.summary = answer.summary || {};
        answer.summary.success = replaceEnvironmentVariables(answer.summary.success ||
            success
            || "You have completed this task!");
        answer.summary.failed = replaceEnvironmentVariables(answer.summary.failed || summaryFailed
             || "Try the steps again.");
        return answer;
    });
    return quickStart;
};
