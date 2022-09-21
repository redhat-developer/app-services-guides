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

5. Deploy the helm chart setting the appropriate values:
 
```
$ helm install . --generate-name --set-string rhoas.config=<configmap-name>,rhoas.secret=<secret-name>
```

To see how to use this code example follow the [guide](../../docs/rhoas/rhoas-helm-guide/).