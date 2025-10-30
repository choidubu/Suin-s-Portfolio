# 빌드 스테이지
FROM gradle:8.3-jdk17 AS build
WORKDIR /app
COPY gradlew .
COPY gradle ./gradle
COPY build.gradle .
COPY src ./src
RUN chmod +x gradlew
RUN ./gradlew build -x test

# 런타임 스테이지
FROM eclipse-temurin:17-jdk
WORKDIR /opt/render/project/src
COPY --from=build /app/build/libs ./libs
CMD ["java", "-jar", "libs/your-app.jar"]