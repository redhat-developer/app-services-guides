Quarkus Kafka Quickstart
========================

This project illustrates how you can interact with a Managed Kafka using Quarkus.

## Prequisite

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

## Update Quarkus Configuration File

Open your favourate editor and update the [application.properties](src/main/resources/application.properties) with the following content

```properties
kafka.bootstrap.servers=<kafka-bootstrap-server>:443
kafka.security.protocol=SSL
kafka.ssl.truststore.location=/tmp/ca.p12
kafka.ssl.truststore.password=<password-from-ca-password-file>
kafka.ssl.truststore.type=PKCS12
```

> NOTE: Change `<password-from-ca-password-file>` to match the content of `/tmp/ca.password` file. 

> NOTE: `<kafka-bootstrap-server>` is the bootstrap server url. See [Bootstrap URL section](#bootstrap-url)

Save, now you are ready to start the application.

## Start the application

Run the application in dev mode with.

```bash
./mvnw quarkus:dev
```

Then, open your browser to `http://localhost:8080/prices.html`, and you should see a fluctuating price.

## Anatomy

In addition to the `prices.html` page, the application is composed by 3 components:

* `PriceGenerator` - a bean generating random price. They are sent to a Kafka topic
* `PriceConverter` - on the consuming side, the `PriceConverter` receives the Kafka message and convert the price.
The result is sent to an in-memory stream of data
* `PriceResource`  - the `PriceResource` retrieves the in-memory stream of data in which the converted prices are sent and send these prices to the browser using Server-Sent Events.

The interaction with Kafka is managed by MicroProfile Reactive Messaging.
The configuration is located in the [application configuration](src/main/resources/application.properties).

## Running in JVM mode

Package the application with

```bash
./mvnw clean package
```

and run with

```bash
java -jar target/mas-kafka-1.0-SNAPSHOT-runner.jar
```

## Running in native

You can compile the application into a native binary using:
```bash
./mvnw clean install -Pnative
```

and run with:
```bash
./target/mas-kafka-1.0-SNAPSHOT-runner
```