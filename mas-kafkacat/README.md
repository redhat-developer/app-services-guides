Using Kafkacat with Managed Kafka Quickstart
============================================

This project illustrates how you can interact with a Managed Kafka using [Kafkacat](https://github.com/edenhill/kafkacat).


## Prequisite

- [Kafkacat](https://github.com/edenhill/kafkacat)
- [jq](https://stedolan.github.io/jq/)
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
kubectl get secret <cluster-name>-cluster-ca-cert -o jsonpath='{.data.ca\.cert}' | base64 -d > /tmp/ca.cert
```

## Retrieve Bootstrap URL

```bash
CLUSTER_ID=$(rhmas kafka list | grep '<your-cluster-name>' | awk '{print $1}')
BOOTSTRAP_URL=$(rhmas kafka get $CLUSTER_ID | jq -r '.bootstrapServerHost')
```

Where `<your-cluster-name>` is the name of the cluster.

## Produce a message.
```bash
kafkacat -t my-topic -b "$BOOTSTRAP_URL:443" -X security.protocol=SSL -X ssl.ca.location=/tmp/ca.cert -P

First message
Second message
Third message
```



## Consume a message.
start the consumer

```bash
kafkacat -t my-topic -b "$BOOTSTRAP_URL:443" -X security.protocol=SSL -X ssl.ca.location=/tmp/ca.cert -C
```

You should see

```log
First message
Second message
Third message
```