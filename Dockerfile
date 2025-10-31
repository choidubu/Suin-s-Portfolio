# --------------------
# 빌드 스테이지
# --------------------
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

# --------------------
# 런타임 스테이지
# --------------------
FROM eclipse-temurin:21-jdk
WORKDIR /app

# Jar 이름 통일
COPY --from=build /app/build/libs/*.jar ./app.jar

# 환경 변수로 DB 연결 정보 전달
ENV SPRING_DATASOURCE_URL=jdbc:postgresql://dpg-d40sb1s9c44c73cc1ajg-a.singapore-postgres.render.com:5432/portfolio_db_d1aq
ENV SPRING_DATASOURCE_USERNAME=portfolio_user
ENV SPRING_DATASOURCE_PASSWORD=DuEtPnvb6uYRB7ginffwDdeWnCgdQIw9

# 실행
CMD ["java", "-jar", "app.jar"]
