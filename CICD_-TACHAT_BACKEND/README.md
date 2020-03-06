# Run this project using docker
## Production environment
```
docker-compose up -d
```
## Development environment
```
docker-compose -f ./docker-compose.dev.yml up
```
# Stopping project
```
docker-compose down
```
# Dependency
- Chat server is run along with the application server
- Chat server is created as a microservice which handle chat related things
- There is a folder named as **socket-folder** which contains the microservice code

# Note
- Application server runs on port 8001
- Chat server runs on port 9001
- Make sure the ports are not blocked by the firewall

# Things to know
- This application is developed with REST architecture and follows REST API standard norms