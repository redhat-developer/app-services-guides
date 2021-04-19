Quarkus Kafka Quickstart
========================

Based on https://github.com/quarkusio/quarkus-quickstarts/blob/main/kafka-quickstart/README.md

This project illustrates how you can interact with Apache Kafka using MicroProfile Reactive Messaging.

## RHOAS addons

RHOAS extends kafka quickstarts by adding Kubernetes Servic Binding capabilities that will automatically discover configuration.

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