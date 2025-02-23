# rhoas-helm-template

Example how to use RHOAS services with Helm.
This example deploys Kafka Example application to your cluster.

## Running the chart:

1. Generate connection configuration as ConfigMap:

```
rhoas generate-config --type configmap --output-file ./rhoas-services.yaml 
```

2. Create service account and save its credentials as a Secret

```
$ rhoas service-account create --file-format secret --output-file ./rhoas-secrets.yaml
```

3. Grant permission to the service account to produce and consume messages from Kafka instance:

```
rhoas kafka acl grant-access --producer --consumer --service-account <service-account-id> --topic all --group all
```

4. Apply the ConfigMap and Secret to the OpenShift cluster

```
$ oc apply -f ./rhoas-secrets.yaml
```

```
$ oc apply -f ./rhoas-services.yaml
```

5. Deploy the Helm chart with the appropriate values:

`helm install` command is used to install a chart to the OpenShift cluster.
`Values` is a built-in object that provides access to values passed in the chart.

The Helm chart uses the follwing values in the templates:

* `rhoas.config` - Name of the ConfigMap object containing configurations deployed in the OpenShift cluster
* `rhoas.secret` - Name of the Secret object containing service-account credentials deployed in the OpenShift cluster



There are various ways to provide values:

* The default method is specifying values in the `values.yaml` file. An example is shown below:

```
## Example values.yaml file
rhoas: 
   config: my-service-context-configuration
   secret: service-account-credentials
```

* Specifying a YAML file of another name using the the --values flag:
    ```
    helm install . --generate-name --values my-values.yaml
    ```
* Passing values directly from the command line using the `--set-string` flag:
    ```
    helm install . --generate-name --set-string rhoas.config=my-context-3-configuration
    ```

To see how to use this code example follow the [guide](../../docs/rhoas/rhoas-helm-guide/).