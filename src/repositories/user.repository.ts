import {
  AttributeValue,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  TransactWriteItemsCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities';
import { TournamentGroupRepository } from '.';

@Injectable()
export class UserRepository {
  private readonly tableName = 'Users';
  private readonly client: DynamoDBClient;

  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => TournamentGroupRepository))
    private readonly tournamentGroupRepository: TournamentGroupRepository,
  ) {
    this.client = new DynamoDBClient({
      region: 'eu-central-1',
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });
  }

  public async userWithUsernameExists(username: string): Promise<boolean> {
    const command = new GetItemCommand({
      TableName: this.tableName,
      Key: {
        username: {
          S: username,
        },
      },
      ProjectionExpression: 'username', // retrieve only the 'username' attribute
    });

    try {
      const result = await this.client.send(command);
      return Boolean(result.Item);
    } catch (error) {
      console.error('Error checking user existence:', error);
      throw new InternalServerErrorException(
        'Internal Server Error in userExists query',
      );
    }
  }

  public async findUserByUsername(username: string): Promise<User | undefined> {
    const command = new GetItemCommand({
      TableName: this.tableName,
      Key: {
        username: {
          S: username,
        },
      },
    });

    try {
      const result = await this.client.send(command);

      if (result.Item) {
        return User.newInstanceFromDynamoDBObject(result.Item);
      }

      return undefined;
    } catch (error) {
      console.error('Error finding user with username:', error);
      throw new InternalServerErrorException(
        'Internal Server Error in findUserByUsername query',
      );
    }
  }

  public async upsertOne(data: User): Promise<User> {
    const itemObject: Record<string, AttributeValue> = {
      username: {
        S: data.username,
      },
      password: {
        S: data.password,
      },
      countryCode: {
        S: data.countryCode,
      },
      coins: {
        N: String(data.coins),
      },
      level: {
        N: String(data.level),
      },
      levelAndUsername: {
        S: data.levelAndUsername,
      },
      currGroupId: {
        S: String(data.currGroupId),
      },
      claimedReward: {
        BOOL: Boolean(data.claimedReward),
      },
    };

    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: itemObject,
      ConditionExpression: 'attribute_not_exists(username)',
    });

    try {
      await this.client.send(command);
      return data;
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        throw new ConflictException('User with this username already exists');
      }
      console.error('Error creating user:', error);
      throw new InternalServerErrorException(
        'Internal Server Error in upsertOne query',
      );
    }
  }

  public async completeLevel(user: User): Promise<void> {
    const updateCommand = new UpdateItemCommand({
      TableName: this.tableName,
      Key: {
        username: { S: user.username },
      },
      UpdateExpression:
        'SET coins = coins + :coinsVal, level = level + :levelVal',
      ExpressionAttributeValues: {
        ':coinsVal': { N: '100' },
        ':levelVal': { N: '1' },
      },
    });

    try {
      await this.client.send(updateCommand);
    } catch (error) {
      console.error(
        'Error updating user during complete level request:',
        error,
      );
      throw new InternalServerErrorException(
        'Internal Server Error in completeLevel query',
      );
    }
  }

  public async completeLevelWithScoreUpdate(user: User): Promise<void> {
    const transactionCommand = new TransactWriteItemsCommand({
      TransactItems: [
        {
          Update: {
            TableName: this.tableName,
            Key: {
              username: { S: user.username },
            },
            UpdateExpression:
              'SET coins = coins + :coinsVal, level = level + :levelVal',
            ExpressionAttributeValues: {
              ':coinsVal': { N: '100' },
              ':levelVal': { N: '1' },
            },
          },
        },
        {
          Update: {
            TableName: this.tournamentGroupRepository.getTableName(),
            Key: {
              groupId: { S: user.currGroupId },
            },
            UpdateExpression: 'SET tournamentScore = tournamentScore + :val',
            ExpressionAttributeValues: {
              ':val': { N: '1' },
            },
          },
        },
      ],
    });

    try {
      await this.client.send(transactionCommand);
    } catch (error) {
      console.error(
        'Error updating user during complete level with score update request:',
        error,
      );
      throw new InternalServerErrorException(
        'Internal Server Error in completeLevelWithScoreUpdate query',
      );
    }
  }

  public getTableName(): string {
    return this.tableName;
  }
}
