Quarkus Kafka Avro Quick Start
========================
This project is an example of using service binding to connect a managed Kafka instance and a managed Service Registry to an application.

# Building

This project uses Maven and Java 11+ to build. 

To build the project in native mode run : 

```
./mvnw package -Pnative
```

To build using the Quarkus fast jvm 

```
./mvnw package
```

# Containers

The provided Dockerfiles may be used to create containers, and the jib may also be used to build a container with maven.

Example container build using jib and the Quarkus fast jvm : 

```
./mvnw clean package --file pom.xml --no-transfer-progress \
                      -Dquarkus.container-image.build=true \
                      -Dquarkus.container-image.tag=latest\
                      -Dquarkus.container-image.image=quay.io/rhoas/kafka-avro-schema-quickstart
```