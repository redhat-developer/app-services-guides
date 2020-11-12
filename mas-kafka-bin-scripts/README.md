Using Bin Scripts with Managed Kafka Quickstart
============================================

This project illustrates how you can interact with a Managed Kafka using Kafka Bin Scripts.

## Prerequisite

- [Kafka Bin Scripts](https://www.apache.org/dyn/closer.cgi?path=/kafka/2.6.0/kafka_2.13-2.6.0.tgz)
- [rhmas cli](https://github.com/bf2fc6cc711aee1a0c2a/cli/releases)
- [kubectl](https://kubernetes.io/fr/docs/reference/kubectl/overview/). This is temporary required

## Spinning a Managed Kafka cluster

First you need a Kafka cluster. You can follow the instructions to create one.

Using the [RHMAS CLI](https://github.com/bf2fc6cc711aee1a0c2a/cli/releases), login and create a new cluster:

```bash
rhmas login --token=<token-from-token-page>
rhmas kafka create --name=<your-cluster-name>
```
> NOTE: `your-cluster-name` is the name of your cluster
> NOTE: The token currently need to come from stagging environment:
https://qaprodauth.cloud.redhat.com/openshift/token

Wait a couple of seconds for cluster to provision.

You can use the:
```bash
rhmas kafka list
``` 

to check the status of the provisioned Kafka. 

At the moment we are missing the certificates, since this is not returned by the API. 
To retrieve them, we'll need `kubectl` and access to the staging environment.

The rest of the commands assumes that you are logged in to the staging environment OSD cluster.

> NOTE: Certificates retrieval part will be automated by the CLI (We'll need some work on the API front).

Retrieve certificates. 
```bash
kubectl get secret <cluster-name>-cluster-ca-cert -o jsonpath='{.data.ca\.p12}' | base64 -d > /tmp/ca.p12
```

Certificate password
```bash
kubectl get secret <cluster-name>-cluster-ca-cert-o jsonpath='{.data.ca\.password}' | base64 -d > /tmp/ca.password
```

kafka properties configuration file.

```properties
security.protocol=SSL
ssl.truststore.location=ca.p12
ssl.truststore.password=<password-from-ca-password-file>
ssl.truststore.type=PKCS12
```

> NOTE: Edit the `<password-from-ca-password-file>` so that it matches the password from `/tmp/ca.password`file. 
> Save the configs to `config.properties` file.

## Retrieve Bootstrap URL

```bash
BOOTSTRAP_URL=$(kubectl get routes | awk 'END{print $2}')
```

## Produce messages.

```bash
./bin/kafka-console-producer.sh -topic my-topic --bootstrap-server "$BOOTSTRAP_URL:443" --producer.config config.properties

First message
Second message
Third message
```


## Consume messages.

Start the consumer

```bash
./bin/kafka-console-consumer.sh -topic my-topic --bootstrap-server "$BOOTSTRAP_URL:443" --from-beginning --consumer.config config.properties
```

You should see

```log
First message
Second message
Third message
```
