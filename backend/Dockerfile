# ---- Build Stage ----
FROM gradle:8.4.0-jdk21 AS build

WORKDIR /app

# Copy Gradle wrapper and build files first for better caching
COPY build.gradle settings.gradle ./
COPY gradle ./gradle
COPY gradlew gradlew.bat ./

# Download dependencies (improves build cache)
RUN chmod +x gradlew
RUN ./gradlew build --no-daemon --stacktrace -x test || return 0

# Copy the rest of the source code
COPY src ./src

# Build the application
RUN chmod +x gradlew
RUN ./gradlew build --no-daemon --stacktrace -x test

# ---- Run Stage ----
FROM openjdk:21-jdk-slim

WORKDIR /app

# Copy the built JAR from the build stage
COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
