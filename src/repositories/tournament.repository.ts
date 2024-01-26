import {
  AttributeValue,
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
  QueryCommandOutput,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Tournament } from '../entities';
import { IsOngoing } from '../enums';

@Injectable()
export class TournamentRepository {
  private readonly tableName = 'Tournaments';
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

  public async upsertOne(data: Tournament): Promise<Tournament> {
    const itemObject: Record<string, AttributeValue> = {
      id: {
        S: data.id,
      },
      startTime: {
        S: data.startTime,
      },
      duration: {
        N: String(data.duration),
      },
      isOngoing: {
        S: data.isOngoing,
      },
    };

    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: itemObject,
    });

    try {
      await this.client.send(command);
      return data;
    } catch (error) {
      console.error('Error creating tournament:', error);
      throw new InternalServerErrorException(
        'Internal Server Error in upsertOne query',
      );
    }
  }

  public async findActiveTournament(): Promise<QueryCommandOutput> {
    const queryCommand = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'isOngoingIndex',
      KeyConditionExpression: 'isOngoing = :val',
      ExpressionAttributeValues: {
        ':val': { S: IsOngoing.TRUE },
      },
      ProjectionExpression: 'id', // Replace with actual attribute names
      Limit: 1,
    });
    const result = await this.client.send(queryCommand);
    return result;
  }

  public async endActiveTournament(): Promise<void> {
    try {
      const activeTournament = await this.findActiveTournament();
      if (activeTournament.Items && activeTournament.Items.length > 0) {
        const activeTournamentId = activeTournament.Items[0].id.S;

        const updateCommand = new UpdateItemCommand({
          TableName: this.tableName,
          Key: {
            id: { S: activeTournamentId },
          },
          UpdateExpression: 'set isOngoing = :val',
          ExpressionAttributeValues: {
            ':val': { S: IsOngoing.FALSE },
          },
        });

        await this.client.send(updateCommand);
      } else {
        throw new InternalServerErrorException(
          'No active tournament in the system',
        );
      }
    } catch (error) {
      console.error('Error ending active tournament:', error);
      throw new InternalServerErrorException(
        'Internal Server Error in endActiveTournament query',
      );
    }
  }

  public getTableName(): string {
    return this.tableName;
  }
}
