Quarkus Kafka Quickstart
========================

Based on https://github.com/quarkusio/quarkus-quickstarts/blob/main/kafka-quickstart/README.md

This project illustrates how you can interact with Apache Kafka using MicroProfile Reactive Messaging.

## Kafka cluster

First you need a Kafka cluster. You can follow the instructions from the [Apache Kafka web site](https://kafka.apache.org/quickstart) or run `docker-compose up` if you have docker installed on your machine.

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

`mvn clean install -Pnative`

and run with:

`./target/kafka-quickstart-1.0.0-SNAPSHOT-runner` 

## RHOAS addons

RHOAS extends kafka quickstarts by adding Kubernetes Servic Binding capabilities that will automatically discover configuration.
Additionally


### RHOAS image 

In case you do not have any docker build chain or account to push your image you can use existing image that is based on this code:
``` 
quay.io/rhoas/rhoas-quarkus-kafka-quickstart
```

To apply this image directly to kubernetes or openshift use template :
```
oc apply -f ./kubernetes/kubernetes.yml
```

### RHOAS env profiles

To showcase multiple way to configure your Kafka instances with RHOAS we have used Quarkus configuration profiles.
Profiles are declared by prefix. If you wish to use those properties in your application profile prefixes needs to be removed.

To build application with specific profile execute 
```
./mvnw package -Dquarkus.profile=dev-env
```