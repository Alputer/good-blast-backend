import {
  AttributeValue,
  DynamoDBClient,
  GetItemCommand,
  QueryCommand,
  QueryCommandOutput,
  TransactWriteItemsCommand,
} from '@aws-sdk/client-dynamodb';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TournamentGroup } from '../entities';
import { TournamentRepository } from './tournament.repository';
import { IsOngoing } from '../enums';
import { UserRepository } from './user.repository';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TournamentGroupRepository {
  private readonly tableName = 'TournamentGroups';
  private readonly client: DynamoDBClient;

  constructor(
    private readonly configService: ConfigService,
    private readonly tournamentRepository: TournamentRepository,
    private readonly userRepository: UserRepository,
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

  public async findAvailableGroup(): Promise<QueryCommandOutput> {
    const queryCommand = new QueryCommand({
      TableName: this.tournamentRepository.getTableName(),
      IndexName: 'isOngoingIndex',
      KeyConditionExpression: 'isOngoing = :val',
      ExpressionAttributeValues: {
        ':val': { S: IsOngoing.TRUE },
      },
      ProjectionExpression: 'id, availableGroupId, availableGroupItemCount', // Replace with actual attribute names
      Limit: 1,
    });
    const result = await this.client.send(queryCommand);
    return result;
  }

  public async findTournamentGroupByGroupId(
    groupId: string,
  ): Promise<TournamentGroup | undefined> {
    const command = new GetItemCommand({
      TableName: this.tableName,
      Key: {
        groupId: {
          S: groupId,
        },
      },
      ProjectionExpression: 'tournamentId',
    });

    try {
      const result = await this.client.send(command);

      if (result.Item) {
        return TournamentGroup.newInstanceFromDynamoDBObject(result.Item);
      }

      return undefined;
    } catch (error) {
      console.error('Error finding tournament group with group id:', error);
      throw new InternalServerErrorException(
        'Internal Server Error in findTournamentGroupByGroupId query',
      );
    }
  }

  public async upsertOne(
    data: TournamentGroup,
    availableGroupItemCount: number,
  ): Promise<TournamentGroup> {
    const tournamentGroupItemObject: Record<string, AttributeValue> = {
      groupId: {
        S: data.groupId,
      },
      username: {
        S: data.username,
      },
      tournamentId: {
        S: data.tournamentId,
      },
      tournamentScore: {
        N: String(data.tournamentScore),
      },
    };

    const transactionCommand = new TransactWriteItemsCommand({
      TransactItems: [
        {
          Put: {
            TableName: this.tableName,
            Item: tournamentGroupItemObject,
          },
        },
        {
          Update: {
            TableName: this.userRepository.getTableName(),
            Key: {
              username: { S: data.username },
            },
            UpdateExpression:
              'SET groupId = :newGroupId, claimedReward = :claimedRewardVal',
            ExpressionAttributeValues: {
              ':newGroupId': { S: data.groupId },
              ':claimedRewardVal': { BOOL: false },
            },
          },
        },
        {
          Update:
            availableGroupItemCount == 34
              ? {
                  TableName: this.tournamentRepository.getTableName(),
                  Key: {
                    id: { S: data.tournamentId },
                  },
                  UpdateExpression:
                    'SET availableGroupItemCount = :val1, availableGroupId = :val2',
                  ConditionExpression:
                    'availableGroupItemCount = :expectedValue',
                  ExpressionAttributeValues: {
                    ':val1': { N: '0' },
                    ':val2': { S: uuidv4() },
                    ':expectedValue': { N: String(availableGroupItemCount) },
                  },
                }
              : {
                  TableName: this.tournamentRepository.getTableName(),
                  Key: {
                    id: { S: data.tournamentId },
                  },
                  UpdateExpression:
                    'SET availableGroupItemCount = availableGroupItemCount + :val',
                  ConditionExpression:
                    'availableGroupItemCount = :expectedValue',
                  ExpressionAttributeValues: {
                    ':val': { N: '1' },
                    ':expectedValue': { N: String(availableGroupItemCount) },
                  },
                },
        },
      ],
    });

    try {
      await this.client.send(transactionCommand);
      return data;
    } catch (error) {
      console.error('Error in transaction:', error);
      throw new InternalServerErrorException(
        'Internal Server Error in upsertOne transaction',
      );
    }
  }

  public getTableName(): string {
    return this.tableName;
  }
}
