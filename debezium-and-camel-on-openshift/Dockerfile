ARG DEBEZIUM_VERSION=1.4

FROM debezium/connect:${DEBEZIUM_VERSION} as upstream

COPY docker-maven-download.sh /usr/local/bin/docker-maven-download
RUN docker-maven-download camel-kafka sql 0.7.2 c2bb38c684585fd5d99533ae5ad68d9e && \
    MAVEN_DEP_DESTINATION=/kafka/connect/camel-sql-kafka-connector/ docker-maven-download central mysql mysql-connector-java 8.0.23 561fc3e1890b16122375d0c08a5ee93f && \
    MAVEN_DEP_DESTINATION=/kafka/connect/camel-sql-kafka-connector/ docker-maven-download central org/postgresql postgresql 42.2.19 a48d7793a7f1f726ce615e4d36b413e8 && \
    MAVEN_DEP_DESTINATION=/kafka/connect/camel-sql-kafka-connector/ docker-maven-download central org/apache/camel camel-debezium-common 3.8.0 f37e2ed6055c3a17ddf904eefdc7398d

FROM registry.redhat.io/amq7/amq-streams-kafka-26-rhel7:1.6.2-1

COPY --from=upstream /kafka/connect/debezium-connector-postgres/ /opt/kafka/plugins/debezium-connector-postgres/
COPY --from=upstream /kafka/connect/debezium-connector-mysql/ /opt/kafka/plugins/debezium-connector-mysql/
COPY --from=upstream /kafka/connect/camel-sql-kafka-connector/ /opt/kafka/plugins/camel-sql-kafka-connector/

USER 1001
