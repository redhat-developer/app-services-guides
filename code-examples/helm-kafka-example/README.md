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

5. Deploy the helm chart with the appropriate values:

`helm install` command is used to install a chart to the OpenShift cluster.
`Values` is a built-in object that provides access to values passed in the chart.

The Helm chart uses the follwing values in the templates:

`rhoas.config` - Name of the ConfigMap object containing configurations deployed in the OpenShift cluster
`rhoas.secret` - Name of the Secret object containing service-account credentials deployed in the OpenShift cluster



There are various ways to provide values:

    1. The default method is specifying values in the `values.yaml` file.
    2. Specifying a yaml file with defined values using the `--values` flag:
    ```
    helm install . --generate-name --values my-values.yaml
    ```
    3. Passing values from the command line using the `--set-string` flag:
    ```
    helm install . --generate-name --set-string rhoas.config=my-context-3-configuration
    ```

To see how to use this code example follow the [guide](../../docs/rhoas/rhoas-helm-guide/).