FROM maven:3.9.5-eclipse-temurin-21-alpine AS build
COPY . .
RUN mvn  package -DskipTests

FROM eclipse-temurin:21-jre-alpine
COPY --from=build /target/*.jar app.jar
EXPOSE 9090
ENTRYPOINT ["java","-jar","/app.jar"]

