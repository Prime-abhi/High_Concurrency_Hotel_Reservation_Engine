# High_Concurrency_Hotel_Reservation_Engine — Local Setup

## Prerequisites
- Java 17 or 21 (check with `java -version`)
- Docker Desktop (installed and running)
- Node.js + npm (for the React frontend, later weeks)
- An IDE (Eclipse / IntelliJ / VS Code)

## 1. Clone the repo
```
git clone <repo-url>
cd hotel-reservation-engine
```

## 2. Start Postgres + Redis
Make sure Docker Desktop is open, then from the project root:
```
docker-compose up -d
```

Check both containers are running:
```
docker ps
```
You should see `hotel-postgres` and `hotel-redis` listed.

## 3. Configure the backend
Copy `application.properties` into `src/main/resources/application.properties`
(already included in the repo — no changes needed unless your local port
5432 or 6379 is already in use by something else).

## 4. Run the Spring Boot app
From Eclipse: right-click the project → Run As → Spring Boot App
Or from terminal:
```
./mvnw spring-boot:run
```

The API will be available at `http://localhost:8080`.

## 5. Stopping everything
```
docker-compose down
```
Add `-v` if you also want to wipe the database volume:
```
docker-compose down -v
```

## Troubleshooting
- **Port already in use (5432 or 6379)**: something else on your machine
  is already using Postgres/Redis. Either stop that service or change the
  port mapping in `docker-compose.yml` (e.g. `"5433:5432"`) and update
  `application.properties` to match.
- **Docker containers not starting**: make sure Docker Desktop is actually
  running (check the whale icon in your system tray/menu bar) before
  running `docker-compose up -d`.
