import { Injectable, OnModuleInit } from "@nestjs/common";
import { DrizzleService } from "./drizzle.service";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from './schema';

@Injectable()
export class BaseDrizzleService implements OnModuleInit {
  protected db: NodePgDatabase<typeof schema>;

  constructor(protected drizzleService: DrizzleService) {}

  async onModuleInit() {
    this.db = await this.drizzleService.getDb();
  }
}