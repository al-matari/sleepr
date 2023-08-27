import { Logger, NotFoundException } from '@nestjs/common';
import { FilterQuery, Model, Types, UpdateQuery, Aggregate } from 'mongoose';
import { AbstractDocument } from './abstract.schema';
import { CreateIndexesOptions, DeleteResult, UpdateResult } from 'mongodb';

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  protected abstract readonly logger: Logger;

  constructor(protected readonly model: Model<TDocument>) {}

  private async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      this.logger.error('An error occurred:', error);
      throw error;
    }
  }

  async create(document: Omit<TDocument, '_id'>): Promise<TDocument> {
    return this.executeWithErrorHandling(async () => {
      const createdDocument = new this.model({
        ...document,
        _id: new Types.ObjectId(),
      });
      return (await createdDocument.save()).toJSON() as unknown as TDocument;
    });
  }

  async findById(id: string): Promise<TDocument | null> {
    return this.executeWithErrorHandling(async () => {
      if (!Types.ObjectId.isValid(id)) {
        throw new NotFoundException('Invalid ID format.');
      }
      return this.model.findById(id, {}, { lean: true });
    });
  }

  async findManyById(ids: string[]): Promise<TDocument[]> {
    return this.executeWithErrorHandling(async () => {
      ids.forEach((id) => {
        if (!Types.ObjectId.isValid(id)) {
          throw new NotFoundException('Invalid ID format.');
        }
      });
      return this.model.find({ _id: { $in: ids } }, {}, { lean: true });
    });
  }

  async findOne(
    filterQuery: FilterQuery<TDocument>,
  ): Promise<TDocument | null> {
    return this.executeWithErrorHandling(async () => {
      const document = await this.model.findOne(
        filterQuery,
        {},
        { lean: true },
      );
      if (!document) {
        this.logger.warn('Document not found with filterQuery', filterQuery);
        throw new NotFoundException('Document not found.');
      }
      return document;
    });
  }

  async aggregate(aggregateQuery: any[]): Promise<any[]> {
    return this.executeWithErrorHandling(async () => {
      const aggregate: Aggregate<TDocument[]> =
        this.model.aggregate(aggregateQuery);
      return aggregate.exec();
    });
  }

  async find(filterQuery: FilterQuery<TDocument>): Promise<TDocument[]> {
    return this.executeWithErrorHandling(async () => {
      return this.model.find(filterQuery, {}, { lean: true });
    });
  }

  async findCursor(filterQuery: FilterQuery<TDocument>): Promise<any> {
    return this.executeWithErrorHandling(async () => {
      return this.model.find(filterQuery).cursor();
    });
  }

  async createMany(documents: Omit<TDocument, '_id'>[]): Promise<TDocument[]> {
    return this.executeWithErrorHandling(async () => {
      const createdDocuments = documents.map((doc) => ({
        ...doc,
        _id: new Types.ObjectId(),
      }));
      return this.model.create(createdDocuments) as any;
    });
  }

  async findOneByIdAndUpdate(
    id: string,
    update: UpdateQuery<TDocument>,
  ): Promise<TDocument | null> {
    return this.executeWithErrorHandling(async () => {
      return this.model.findByIdAndUpdate(id, update, {
        new: true,
        lean: true,
      });
    });
  }

  async findManyAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ): Promise<UpdateResult> {
    return this.executeWithErrorHandling(async () => {
      return this.model.updateMany(filterQuery, update, {
        new: true,
        lean: true,
      });
    });
  }

  async findOneAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ): Promise<TDocument | null> {
    return this.executeWithErrorHandling(async () => {
      return this.model.findOneAndUpdate(filterQuery, update, {
        new: true,
        lean: true,
      });
    });
  }

  async deleteOneById(id: string): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      return this.model.findByIdAndDelete(id);
    });
  }

  async deleteOne(filterQuery: FilterQuery<TDocument>): Promise<void> {
    return this.executeWithErrorHandling(async () => {
      return this.model.findOneAndDelete(filterQuery);
    });
  }

  async deleteMany(filterQuery: FilterQuery<TDocument>): Promise<DeleteResult> {
    return this.executeWithErrorHandling(async () => {
      return this.model.deleteMany(filterQuery);
    });
  }

  async exist(filterQuery: FilterQuery<TDocument>): Promise<any> {
    return this.executeWithErrorHandling(async () => {
      return this.model.exists(filterQuery);
    });
  }

  async count(filterQuery: FilterQuery<TDocument>): Promise<number> {
    return this.executeWithErrorHandling(async () => {
      return this.model.countDocuments(filterQuery);
    });
  }

  async applyPagination(
    filterQuery: FilterQuery<TDocument>,
    page: number,
    limit: number,
  ): Promise<TDocument[]> {
    return this.executeWithErrorHandling(async () => {
      return this.model
        .find(filterQuery, {}, { lean: true })
        .skip((page - 1) * limit)
        .limit(limit);
    });
  }

  async limitQueryWithId(id: string, limit: number): Promise<TDocument[]> {
    return this.executeWithErrorHandling(async () => {
      return this.model
        .find({ _id: { $gt: id } }, {}, { lean: true })
        .limit(limit);
    });
  }

  async limitQuery(
    filterQuery: FilterQuery<TDocument>,
    limit: number,
  ): Promise<TDocument[]> {
    return this.executeWithErrorHandling(async () => {
      return this.model.find(filterQuery, {}, { lean: true }).limit(limit);
    });
  }

  toggleId(document: TDocument): TDocument {
    // document._id = document._id.toString();
    // delete document._id;
    return document;
  }

  getCollection() {
    return this.model.collection;
  }

  async invokeEvents(document: TDocument, events: string[]): Promise<void> {
    // Your implementation here
  }

  async saveToCache(key: string, data: any, ttl?: number): Promise<void> {
    // Your implementation here
  }

  async retrieveFromCache(key: string): Promise<any | null> {
    // Your implementation here
  }

  convertDateToString(date: Date): string {
    return date.toISOString();
  }

  async createIndex(options: CreateIndexesOptions) {
    return this.executeWithErrorHandling(async () => {
      return this.model.createIndexes(options as any);
    });
  }
}
