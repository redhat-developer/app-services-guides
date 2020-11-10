Quarkus Kafka Quickstart
========================

This project illustrates how you can interact with a Managed Kafka using Quarkus.

## Spinning a Managed Kafka cluster

First you need a Kafka cluster. You can follow the instructions to create one.

Using the [RHMAS CLI](https://github.com/bf2fc6cc711aee1a0c2a/cli/releases), login and create a new cluster:

```bash
rhmas login --token=<token-from-token-page>
rhmas kafka create --name=<your-cluster-name>
```
> NOTE: `your-cluster-name` is the name of your cluster
> NOTE: the token currently need to come from stagging environment:
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

private certificate
```bash
kubectl get secret <cluster-name>-cluster-ca-cert -o jsonpath='{.data.ca\.p12}' | base64 -d > ca.p12
```

certificate password
```bash
kubectl get secret <cluster-name>-cluster-ca-cert-o jsonpath='{.data.ca\.password}' | base64 -d > ca.password
```

kafka properties configuration file.

```properties
security.protocol=SSL
ssl.truststore.location=ca.p12
ssl.truststore.password=<password-from-ca-password-file>
ssl.truststore.type=PKCS12
```

> NOTE: Edit the `<password-from-ca-password-file>` so that it matches the password from `ca.password`. Save the configs to `config.properties` file.

## Bootstrap URL

```bash
BOOTSTRAP_URL=$(kubectl get routes | awk 'END{print $2}')
```

## BinScripts Producer/Consumer to test if cluster was up.
```bash
./bin/kafka-console-producer.sh -topic my-topic --bootstrap-server "$BOOTSTRAP_URL:443" --producer.config config.properties
```

Enter messages followed by enter.

On another terminal start the consumer

```bash
./bin/kafka-console-consumer.sh -topic my-topic --bootstrap-server "$BOOTSTRAP_URL:443" --consumer.config config.properties
```

## Update application.properties

Open your favourate editor and update the [application.properties](src/main/resources/application.properties) with the following content


```properties
%prod.kafka.bootstrap.servers=<kafka-bootstrap-server>:443
%prod.kafka.security.protocol=SSL
%prod.kafka.ssl.truststore.location=ca.p12
%prod.kafka.ssl.truststore.password=<password-from-ca-password-file>
%prod.kafka.ssl.truststore.type=PKCS12
```

> NOTE: Change `<password-from-ca-password-file>` to match the content `ca.password` file. 
> NOTE: `<kafka-bootstrap-server>` is the bootstrap server url. See [Bootstrap URL section](#bootstrap-url)

Save, now you are ready to start the application.

## Start the application


The application can be started using: 

```bash
mvn quarkus:dev
```  

Then, open your browser to `http://localhost:8080/prices.html`, and you should see a fluctuating price.

## Anatomy

In addition to the `prices.html` page, the application is composed by 3 components:

* `PriceGenerator` - a bean generating random price. They are sent to a Kafka topic
* `PriceConverter` - on the consuming side, the `PriceConverter` receives the Kafka message and convert the price.
The result is sent to an in-memory stream of data
* `PriceResource`  - the `PriceResource` retrieves the in-memory stream of data in which the converted prices are sent and send these prices to the browser using Server-Sent Events.

The interaction with Kafka is managed by MicroProfile Reactive Messaging.
The configuration is located in the application configuration.

## Running in native

You can compile the application into a native binary using:
```bash
mvn clean install -Pnative
```


and run with:
```bash
./target/mas-kafka-1.0-SNAPSHOT-runner
```
