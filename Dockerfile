# 빌드 스테이지
FROM eclipse-temurin:21-jdk AS build

# Gradle 설치
RUN apt-get update && \
    apt-get install -y wget unzip && \
    wget https://services.gradle.org/distributions/gradle-8.3-bin.zip -P /tmp && \
    unzip -d /opt/gradle /tmp/gradle-8.3-bin.zip && \
    rm /tmp/gradle-8.3-bin.zip
ENV PATH="/opt/gradle/gradle-8.3/bin:${PATH}"

WORKDIR /app
COPY gradlew .
COPY gradle ./gradle
COPY build.gradle .
COPY src ./src
RUN chmod +x gradlew
RUN ./gradlew build -x test

# 런타임 스테이지
FROM eclipse-temurin:21-jdk
WORKDIR /app

# 빌드 결과 JAR 복사
COPY --from=build /app/build/libs/Suin-s-Portfolio-1.0.0.jar .

# 실행
CMD ["java", "-jar", "Suin-s-Portfolio-1.0.0.jar"]

