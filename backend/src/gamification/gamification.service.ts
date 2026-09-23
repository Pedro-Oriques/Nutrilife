import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MongoServerError } from 'mongodb';
import { PointsRecord, PointsRecordDocument } from './schemas/points-record.schema';
import { Water, WaterDocument } from '../water/schemas/water.schema';

export type ActionType =
  | 'login'
  | 'agua'
  | 'peso'
  | 'cafe_da_manha'
  | 'almoco'
  | 'jantar'
  | 'lanche';

const SCORING_RULES: Record<ActionType, { points: number; limitType: 'daily' | 'monthly' }> = {
  login: { points: 50, limitType: 'daily' },
  agua: { points: 100, limitType: 'daily' },
  peso: { points: 200, limitType: 'monthly' },
  cafe_da_manha: { points: 200, limitType: 'daily' },
  almoco: { points: 200, limitType: 'daily' },
  jantar: { points: 200, limitType: 'daily' },
  lanche: { points: 200, limitType: 'daily' },
};

@Injectable()
export class GamificationService {
  constructor(
    @InjectModel(PointsRecord.name)
    private pointsRecordModel: Model<PointsRecordDocument>,
    @InjectModel(Water.name)
    private waterModel: Model<WaterDocument>,
  ) {}

  async awardPoints(userId: string, actionType: ActionType, date?: string): Promise<void> {
    const rule = SCORING_RULES[actionType];
    const entryDate = date ?? new Date().toISOString().split('T')[0];
    const userIdStr = userId.toString();

    let existing: PointsRecordDocument | null = null;

    if (rule.limitType === 'monthly') {
      const monthPrefix = entryDate.slice(0, 7); // YYYY-MM
      existing = await this.pointsRecordModel.findOne({
        userId: new Types.ObjectId(userIdStr),
        actionType,
        date: { $regex: `^${monthPrefix}` },
      });
    } else {
      existing = await this.pointsRecordModel.findOne({
        userId: new Types.ObjectId(userIdStr),
        actionType,
        date: entryDate,
      });
    }

    if (existing) {
      return;
    }

    try {
      await this.pointsRecordModel.create({
        userId: new Types.ObjectId(userIdStr),
        actionType,
        points: rule.points,
        date: entryDate,
      });
    } catch (err) {
      if (err instanceof MongoServerError && err.code === 11000) {
        return;
      }
      throw err;
    }
  }

  async getSummary(userId: string): Promise<{
    rankingPosition: number | null;
    totalPoints: number;
    mealsCount: number;
    waterLiters: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const monthPrefix = today.slice(0, 7);

    const userObjectId = new Types.ObjectId(userId.toString());

    // Query all records in the rolling 30-day window
    const records = await this.pointsRecordModel.find({
      userId: userObjectId,
      date: { $gte: startDate },
    });

    const totalPoints = records.reduce((sum, r) => sum + r.points, 0);

    const mealTypes = new Set(['cafe_da_manha', 'almoco', 'jantar', 'lanche']);
    const mealsCount = records.filter((r) => mealTypes.has(r.actionType)).length;

    // Sum actual water consumed in ml from water_tracking, convert to liters
    const waterRecords = await this.waterModel.find({
      userId: userObjectId,
      date: { $gte: startDate },
    });
    const totalWaterMl = waterRecords.reduce((sum, r) => sum + (r.consumedMl || 0), 0);
    const waterLiters = Math.round((totalWaterMl / 1000) * 100) / 100;

    // Ranking position: aggregate points per user for current month
    const monthlyAgg = await this.pointsRecordModel.aggregate<{
      _id: Types.ObjectId;
      total: number;
    }>([
      { $match: { date: { $regex: `^${monthPrefix}` } } },
      { $group: { _id: '$userId', total: { $sum: '$points' } } },
    ]);

    const userMonthly = monthlyAgg.find((entry) => entry._id.toString() === userObjectId.toString());

    let rankingPosition: number | null = null;
    if (userMonthly) {
      const usersAbove = monthlyAgg.filter((entry) => entry.total > userMonthly.total).length;
      rankingPosition = usersAbove + 1;
    }

    return { rankingPosition, totalPoints, mealsCount, waterLiters };
  }

  async getCalendar(userId: string): Promise<Array<{ date: string; points: number }>> {
    const today = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 364 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const records = await this.pointsRecordModel.find({
      userId: new Types.ObjectId(userId.toString()),
      date: { $gte: startDate },
    });

    const pointsByDate = new Map<string, number>();
    for (const record of records) {
      pointsByDate.set(record.date, (pointsByDate.get(record.date) ?? 0) + record.points);
    }

    const calendar: Array<{ date: string; points: number }> = [];
    const cursor = new Date(startDate + 'T00:00:00Z');
    const end = new Date(today + 'T00:00:00Z');

    while (cursor <= end) {
      const dateStr = cursor.toISOString().split('T')[0];
      calendar.push({ date: dateStr, points: pointsByDate.get(dateStr) ?? 0 });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return calendar;
  }

  async getRanking(
    period: string,
    page: number,
    limit: number,
  ): Promise<{
    data: Array<{ userId: string; fullName: string; totalPoints: number; position: number }>;
    total: number;
    page: number;
    limit: number;
  }> {
    const matchStage: Record<string, any> = {};

    if (period === 'weekly') {
      const startDate = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      matchStage.date = { $gte: startDate };
    } else if (period === 'monthly') {
      const startDate = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      matchStage.date = { $gte: startDate };
    }
    // all-time: no date filter

    const pipeline: any[] = [
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $group: {
          _id: '$userId',
          totalPoints: { $sum: '$points' },
        },
      },
      { $sort: { totalPoints: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      {
        $project: {
          _id: 1,
          totalPoints: 1,
          fullName: { $arrayElemAt: ['$userInfo.fullName', 0] },
        },
      },
      // Filter out entries where the $lookup found no matching user (orphaned records)
      { $match: { fullName: { $exists: true, $not: { $in: [null, ''] } } } },
    ];

    // Count total distinct users
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await this.pointsRecordModel.aggregate<{ total: number }>(countPipeline);
    const total = countResult[0]?.total ?? 0;

    // Apply pagination
    const skip = (page - 1) * limit;
    const dataPipeline = [...pipeline, { $skip: skip }, { $limit: limit }];
    const rows = await this.pointsRecordModel.aggregate<{
      _id: Types.ObjectId;
      totalPoints: number;
      fullName: string;
    }>(dataPipeline);

    const data = rows.map((row, index) => ({
      userId: row._id.toString(),
      fullName: row.fullName ?? '',
      totalPoints: row.totalPoints,
      position: skip + index + 1,
    }));

    return { data, total, page, limit };
  }

  async getPoints(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{
    data: Array<{ _id: string; actionType: string; points: number; date: string }>;
    total: number;
    page: number;
    limit: number;
  }> {
    const filter = { userId: new Types.ObjectId(userId.toString()) };
    const total = await this.pointsRecordModel.countDocuments(filter);
    const skip = (page - 1) * limit;

    const records = await this.pointsRecordModel
      .find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const data = records.map((r) => ({
      _id: (r._id as Types.ObjectId).toString(),
      actionType: r.actionType,
      points: r.points,
      date: r.date,
    }));

    return { data, total, page, limit };
  }

  getScoringRules(): Array<{
    actionType: string;
    points: number;
    label: string;
    limitType: string;
  }> {
    return [
      { actionType: 'login', points: 50, label: 'Fazer login', limitType: 'daily' },
      { actionType: 'agua', points: 100, label: 'Registrar consumo de água', limitType: 'daily' },
      { actionType: 'peso', points: 200, label: 'Atualizar peso', limitType: 'monthly' },
      {
        actionType: 'cafe_da_manha',
        points: 200,
        label: 'Registrar café da manhã',
        limitType: 'daily',
      },
      { actionType: 'almoco', points: 200, label: 'Registrar almoço', limitType: 'daily' },
      { actionType: 'jantar', points: 200, label: 'Registrar jantar', limitType: 'daily' },
      { actionType: 'lanche', points: 200, label: 'Registrar lanche', limitType: 'daily' },
    ];
  }
}
