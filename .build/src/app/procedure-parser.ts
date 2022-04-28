/* eslint-disable */

import { QuickStart, QuickStartTask } from '@patternfly/quickstarts';
import {ProcQuickStartParser} from "@app/patternfly-procedure-parser";

export const ProcQuickStartParserWithImageSupport = (
    quickStart: QuickStart & {
        spec: {
            tasks: undefined | QuickStartTask[] | string[];
        };
    },
    basePath: string,
    environmentVariables?: { [name: string]: string },
) => {

    // Use the upstream parser
    const resource =  ProcQuickStartParser(quickStart, environmentVariables);

    // add image path fixing
    function fixImagePath(str: string): string;
    function fixImagePath(str: undefined | string): undefined | string;
    function fixImagePath (str: string | undefined): string | undefined {
        return str === undefined ? undefined :str.replace("<img src=\"\./images", "<img src=\"" + basePath + "/images");
    }

    resource.spec.tasks = resource.spec.tasks?.map(task => {

        task.description = fixImagePath(task.description);
        if (task.summary !== undefined) {
            task.summary.success = fixImagePath(task.summary.success);
            task.summary.failed = fixImagePath(task.summary.failed);
        }
        if (task.review !== undefined) {
            task.review.failedTaskHelp = fixImagePath(task.review.failedTaskHelp);
            task.review.instructions = fixImagePath(task.review.instructions);
        }
        task.title = fixImagePath(task.title);
        return task;
    });
    resource.spec.description = fixImagePath(resource.spec.description)
    resource.spec.introduction = fixImagePath(resource.spec.introduction)
    resource.spec.conclusion = fixImagePath(resource.spec.conclusion);
    return resource;
};