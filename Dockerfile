# ===== 빌드 스테이지 =====
FROM gradle:8.3-jdk21 AS build

# 작업 디렉토리 설정
WORKDIR /app

# Gradle Wrapper와 설정 복사
COPY gradlew .
COPY gradle ./gradle
COPY build.gradle .
COPY settings.gradle .
COPY src ./src

# gradlew 실행 권한 부여
RUN chmod +x gradlew

# 의존성 다운로드 및 빌드 (테스트 제외)
RUN ./gradlew build -x test

# ===== 런타임 스테이지 =====
FROM eclipse-temurin:21-jdk

# 런타임 작업 디렉토리
WORKDIR /opt/render/project/src

# 빌드 스테이지에서 생성된 jar 파일 복사
COPY --from=build /app/build/libs/*.jar ./libs/

# jar 파일 이름 확인 후 실행
CMD ["sh", "-c", "java -jar libs/$(ls libs | grep .jar)"]
