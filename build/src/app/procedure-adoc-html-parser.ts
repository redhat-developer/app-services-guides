import {QuickStart, QuickStartTask} from "@cloudmosaic/quickstarts";

export const ProcedureAdocHtmlParser = (
    body: string,
    id: string,
    environmentVariables?: { [name: string]: string }
) => {
    const replaceEnvironmentVariables = (s: string | undefined) =>
        s?.replace(/\${(\w+)}/, (substring, name) => {
            return environmentVariables ? [name]
                ? environmentVariables[name]
                : substring : substring;
        });

    const bodyDOM = document.createElement("body");
    bodyDOM.innerHTML = body;

    let header = bodyDOM.querySelector("header");
    if (!header) {
        header = bodyDOM.querySelector("#header")
    }
    const displayName = replaceEnvironmentVariables(
        header?.textContent?.trim()
    );
    const introduction = replaceEnvironmentVariables(
        bodyDOM.querySelector(".qs-intro")?.innerHTML.trim()
    );
    const prereqs = bodyDOM.querySelectorAll(".qs-prerequisites ul li");
    const procedures = bodyDOM.querySelectorAll(".qs-task");
    const duration = bodyDOM.querySelector(".qs-duration")?.textContent?.trim();
    const durationString = duration?.match(/\d+/);
    const durationMinutes = parseInt(durationString ? durationString[0] : "0");
    const icon = bodyDOM.querySelector(".qs-icon .icon")?.innerHTML.trim();
    const description = replaceEnvironmentVariables(
        bodyDOM.querySelector(".qs-description")?.innerHTML.trim()
    );
    const conclusion = replaceEnvironmentVariables(
        bodyDOM.querySelector(".qs-conclusion")?.innerHTML.trim()
    );

    let prerequisites: string[] = [];
    prereqs.forEach((n) => {
        if (n.textContent) {
            prerequisites.push(n.textContent.trim());
        }
    });

    let qsTasks: QuickStartTask[] = [];
    procedures.forEach((procedure, index) => {
        const verificationBlock =
            replaceEnvironmentVariables(procedure.querySelector(".olist.qs-task-verification ol")?.innerHTML);
        const description = replaceEnvironmentVariables(
            procedure.querySelector(".qs-task-description")?.innerHTML.trim()
        );
        const ol = replaceEnvironmentVariables(
            procedure.querySelector(".olist.qs-task-procedure ol")?.outerHTML.trim()
        );
        qsTasks.push({
            title: replaceEnvironmentVariables(
                procedure.querySelector(".qs-task-title")?.textContent?.trim()
            ),
            description: `${description}${ol}`,
            review: {
                instructions: verificationBlock || "Have you completed these steps?",
                failedTaskHelp:
                    replaceEnvironmentVariables(
                        procedure.querySelector(".qs-review.failed")?.innerHTML.trim()
                    ) || "This task isn’t verified yet. Try the task again.",
            },
            summary: {
                success:
                    replaceEnvironmentVariables(
                        procedure.querySelector(".qs-summary.success")?.innerHTML.trim()
                    ) || "You have completed this task!",
                failed:
                    replaceEnvironmentVariables(
                        procedure.querySelector(".qs-summary.failed")?.innerHTML.trim()
                    ) || "Try the steps again.",
            },
        });
    });

    const processedAsciiDoc: QuickStart = {
        apiVersion: "v1alpha1",
        kind: "QuickStart",
        metadata: {
            name: id,

        },
        spec: {
            version: 1,
            displayName: displayName || "",
            durationMinutes,
            icon: icon || "",
            description: description || "",
            introduction,
            conclusion,
            prerequisites,
            nextQuickStart: ["todo"],
            tasks: qsTasks,
        },
    };
    return processedAsciiDoc;
};
