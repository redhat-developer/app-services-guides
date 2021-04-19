## Adding Quick Starts to your OpenShift

Add all Quick Starts to your OpenShift cluster
```
oc apply -f https://raw.githubusercontent.com/redhat-developer/app-services-guides/main/devsandbox-quickstarts/rhosak-devsandbox-connect-cli-toolscontainer-quickstart.yaml
oc apply -f https://raw.githubusercontent.com/redhat-developer/app-services-guides/main/devsandbox-quickstarts/rhosak-devsandbox-getting-started-quickstart.yaml
oc apply -f https://raw.githubusercontent.com/redhat-developer/app-services-guides/main/devsandbox-quickstarts/rhosak-devsandbox-kafkacat-toolscontainer.yaml
oc apply -f https://raw.githubusercontent.com/redhat-developer/app-services-guides/main/devsandbox-quickstarts/rhosak-devsandbox-quarkus-bind-cli-toolscontainer-quickstart.yaml
```

## Contributing Quick Starts

Quick starts walk users through completing different tasks in the OpenShift UI console. 
OpenShift provies this capability by creating 
[quick start custom resource](https://github.com/openshift/enhancements/blob/master/enhancements/console/quick-starts.md).
This allows operators and administrators to contribute new quick starts to the
cluster beyond the out-of-the-box set. Typically, quick starts for operators are
created by the operator itself after the operator is installed. In a few cases,
we have out-of-the-box quick starts that guide administrators through the
process of installing an operator. These need to be created before operator
installation through OperatorHub. Any out-of-the-box quick start should be
contributed to the `quickstarts` folder here in the console-operator repo.

To contribute quickstarts, follow the
[guidelines](http://openshift.github.io/openshift-origin-design/conventions/documentation/quick-starts.html)
for writing a quick start and getting the content reviewed. When the
quick start is ready, add the quick start YAML to this folder and open a PR.
Request review from `@DuncanDoyle` 
