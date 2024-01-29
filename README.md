# USED TECHNOLOGIES

- **[NestJs](https://docs.nestjs.com/) with Fastify**: Nodejs framework for server-side applications.
- **Docker**: Containarization Tool.
- **Github Actions**: Automated deployment of the code.
- **EC2**: AWS virtual machine service for running the app.
- **DynamoDB**: For database.

## APP URL AND API DOCUMENTATION

- App url: [http://3.79.253.161](http://3.79.253.161)
- Swagger documentation: [http://3.79.253.161/docs](http://3.79.253.161/docs) (There might be minor inconsistencies between api and the documentation)

## USERS

- Currently, there are 191 users in the system with some progress.
- You can find their credentials in "user_credentials.txt" file to test the system with a user with some progress. You can also create a new user and test the system from scratch.

## HOW TO RUN THE CODE IN LOCAL DEVELOPMENT ENVIRONMENT

Dependencies: Docker.

1. First, you should create DynamoDB tables on AWS. Table definitions and indexes are given in the following section. You should also insert the first tournament entry by hand before running the application. You can use example values given in the `DynamoDB Tables - Tournaments` section.
2. Second, clone the project:
```bash
$ git clone <url>
$ cd good-blast-backend
```
3. Third, create `prod.env` and `dev.env` files in the root folder. You can refer to `prod.env.example` and `dev.env.example` for how to fill it. Even if you do not use the production mode, you should still create `prod.env` file. However, it can be empty.
4. Forth, you should run the following command:
```bash
$ docker-compose up app-dev
```

## HOW TO DEPLOY THE CODE AND RUN IT IN PRODUCTION

1. First, you should create DynamoDB tables on AWS. Table definitions and indexes are given in the following section. You should also insert the first tournament entry by hand before running the application. You can use example values given in the `DynamoDB Tables` section.
2. Second, open an EC2 instance and install git, docker, and docker-compose.
3. Third, clone the project:
```bash
$ git clone <url>
$ cd good-blast-backend
```
4. Forth, create `prod.env` and `dev.env` files in the root folder. You can refer to `prod.env.example` and `dev.env.example` for how to fill it. Even if you do not use the development mode, you should still create `dev.env` file. However, it can be empty.
5. Run:
```bash
$ docker-compose app-prod
```

## DynamoDB Tables

### Users
- Partition key: `username` (String)
- Sort key: none
- Indexes:
  - **CountryCodeGSI**:
    - Partition Key: `countryCode`
    - Sort Key: `levelAndUsername`
  - **LevelGSI**:
    - Partition Key: `dummyPartitionKey`
    - Sort Key: `levelAndUsername`
- Attributes:
  - username
  - password
  - coins
  - levelNum
  - countryCode
  - currGroupId
  - claimedReward
  - joinedTournamentAt
  - levelAndUsername
  - dummyPartitionKey

### Tournaments
- Partition key: `id`
- Sort key: none
- Indexes:
  - **isOngoingIndex**:
    - Partition Key: `isOngoing`
    -  Sort Key: `id`
- Attributes
  - id
    - example: String - 376a3106-4507-455d-8a21-2eafdd639bbe
  - startTime
    - example: String - 2024-01-29T00:00:00.362Z
  - duration
    - example: Number - 86400
  - isOngoing
    - example: String - true
  - availableGroupId
    - example: String - 4596b647-e51a-4f0d-b8ca-1547e16d06ad
  - availableGroupItemCount
    - example: Number - 0


### TournamentGroups
- Partition key: `groupId`
- Sort key: `username`
- Attributes
  - groupId
  - username
  - tournamentId
  - tournamentScore

## APPLIED PERFORMANCE OPTIMIZATIONS

- Created `isOngoingIndex` on Tournaments table: This index is created in order to optimize the query which fetches the ongoing tournament. There will be many tournaments in the system but only one tournament will be active. Using this index, we can get the ongoing tournament directly.
- Created `LevelGSI` index on Users table: This index is used to store users in a sorted manner based on their levels. I created a dummy partition key which has the same value for every item and 	a sort key called levelAndUsername in order to ensure uniqueness. I add 0’s at 	the beginning of levelAndUsername string until making it 7 digit in order to satisfy consistency between string comparison and level comparison. For example level 78 is represented as follows: “0000078#<username>”. I tested the system with 2500 users  the result is always returned between 1 - 1.5 seconds.
- Created `CountryCodeGSI` index on Users table:
This index is used to store users in a sorted manner based on their levels for each country. They are partitioned based on their countryCode and stay sorted based on their levelAndUsername attribute. Remaining logic is similar to LevelGSI index. I tested the system with 2500 users and the result is always returned between 1 - 1.5 seconds.
- Utilized transactions when there are multiple db accesses in the same operation. This both improves performance and ensure consistency in database.
- Created two different docker targets for development and production for better development experience and enhanced production performance

## FUTURE WORK

1. **Integrating Redis**: Especially for `GET /api/leaderboard/global` and `GET /api/leaderboard/country/:countryCode` endpoints,  we can utilize caching to improve speed and reduce database load.
2. **Adding Rate-Limiting**: In order to prevent attacks, we can put a throttler for each endpoint.
3. **Adding Unit Tests**: I could not implement unit tests in the given time. However, they are crucial for robust systems, therefore they should be definitely added.
4. **Adding Pagination**: For `GET /api/leaderboard/global` and `GET /api/leaderboard/country/:countryCode` endpoints, there should be pagination.

