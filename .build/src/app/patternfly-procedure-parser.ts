// COPIED FROM https://github.com/patternfly/patternfly-quickstarts/blob/main/packages/dev/src/quickstarts-data/asciidoc/procedure-parser.ts until it's published to NPMJS
/* eslint-disable */

import { QuickStart, QuickStartTask } from '@patternfly/quickstarts';

export const ProcQuickStartParser = (
    quickStart: QuickStart & {
        spec: {
            tasks: undefined | QuickStartTask[] | string[];
        };
    },
    environmentVariables?: { [name: string]: string },
) => {
    const replaceEnvironmentVariables = (s: string | undefined) =>
        s?.replace(/\${(\w+)}/, (substring, name) => {
            return environmentVariables ? ([name] ? environmentVariables[name] : substring) : substring;
        });

    quickStart.spec.tasks = quickStart.spec.tasks?.map((task: QuickStartTask | string, index) => {
        let proc: string;
        let answer: QuickStartTask;
        if (typeof task === 'string') {
            proc = task;
            answer = {};
        } else {
            // @ts-ignore
            proc = task.proc;
            answer = task;
            // @ts-ignore
            delete task.proc;
        }

        let description = '',
            procedure,
            verification,
            title,
            summaryFailed,
            success,
            reviewFailed: string | undefined,
            prerequisites;
        if (proc) {
            const taskDOM = document.createElement('div');
            taskDOM.innerHTML = proc;

            // remove the screencapture images
            taskDOM.querySelectorAll('.imageblock.screencapture').forEach((node) => {
                node.parentElement?.removeChild(node);
            });

            title = taskDOM
                .querySelector('h1:first-child,h2:first-child,h3:first-child,h4:first-child,h5:first-child')
                ?.innerHTML.trim();
            let sectionBody = taskDOM.querySelector('.sectionbody');
            if (!sectionBody?.hasChildNodes()) {
                // possibly in other templates, where we want to look for article
                sectionBody = taskDOM.querySelector('article');
            }
            if (sectionBody) {
                for (let i = 0; i < sectionBody.children.length || 0; i++) {
                    /**
                     child typically looks like:

                     <div class="paragraph|olist|ulist|admonitionblock">
                     <div class="title">Procedure|Prerequisites|Verification|Note|Warning</div>
                     <ol|ul class="arabic">
                     <li>
                     <li>...
                     </ol|ul>
                     </div>

                     And the below code extracts the <ol> or <ul>
                     Except for when there is no <div class="title|heading"/>, then the description is extracted
                     in the else if below
                     */
                    const child = sectionBody.children.item(i);
                    // find the title
                    const sectionTitle = child?.querySelector('.heading,.title');
                    // should this section be assigned to a specific section
                    const sectionTitleText = sectionTitle?.textContent?.trim();
                    const isKnownSection = ['Procedure', 'Verification', 'Prerequisites'].includes(
                        sectionTitle?.textContent?.trim(),
                    );
                    if (isKnownSection) {
                        switch (sectionTitleText) {
                            case 'Procedure':
                                procedure = child?.querySelector(':not(.heading):not(.title)')?.outerHTML.trim();
                                break;
                            case 'Verification':
                                verification = child?.querySelector(':not(.heading):not(.title)')?.outerHTML.trim();
                                break;
                            case 'Prerequisites':
                                prerequisites = child
                                    ?.querySelector(':not(.heading):not(.title)')
                                    ?.outerHTML.trim();
                                break;
                        }
                    } else if (!procedure) {
                        // Otherwise if it comes before a procedure it's part of the description
                        description = description + child?.outerHTML.trim();
                    }
                }
            }
            success = taskDOM.querySelector('.qs-summary.success')?.innerHTML.trim();
            reviewFailed = taskDOM.querySelector('.qs-review.failed')?.innerHTML.trim();
            summaryFailed = taskDOM.querySelector('.qs-summary.failed')?.innerHTML.trim();
        }

        answer.title = replaceEnvironmentVariables(answer.title || title);
        answer.description = replaceEnvironmentVariables(
            answer.description || `${description} ${prerequisites || ''} ${procedure}`,
        );
        answer.review = answer.review || {};
        answer.review.instructions = replaceEnvironmentVariables(
            answer.review?.instructions || verification || 'Have you completed these steps?',
        );
        answer.review.failedTaskHelp = replaceEnvironmentVariables(
            answer.review.failedTaskHelp ||
            reviewFailed ||
            'This task isn’t verified yet. Try the task again.',
        );
        answer.summary = answer.summary || {};
        answer.summary.success = replaceEnvironmentVariables(
            answer.summary.success || success || 'You have completed this task!',
        );
        answer.summary.failed = replaceEnvironmentVariables(
            answer.summary.failed || summaryFailed || 'Try the steps again.',
        );
        return answer;
    });
    return quickStart;
};