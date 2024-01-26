import {
  AttributeValue,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities';

@Injectable()
export class UserRepository {
  private readonly tableName = 'Users';
  private readonly client: DynamoDBClient;

  constructor(private readonly configService: ConfigService) {
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
        N: String(data.currGroupId),
      },
      claimedReward: {
        BOOL: Boolean(data.claimedReward),
      },
      createdAt: {
        S: data.createdAt,
      },
      updatedAt: {
        S: data.updatedAt,
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

  public getTableName(): string {
    return this.tableName;
  }
}
