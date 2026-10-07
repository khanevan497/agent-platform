import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { AgentsModule } from './agents/agents.module';
import { ToolsModule } from './tools/tools.module';
import { ExecutionsModule } from './executions/executions.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { ApprovalsModule } from './approvals/approvals.module';
import { EvaluationsModule } from './evaluations/evaluations.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('POSTGRES_HOST', 'localhost'),
        port: parseInt(config.get('POSTGRES_PORT', '5432')),
        database: config.get('POSTGRES_DB', 'agent_platform'),
        username: config.get('POSTGRES_USER', 'agent_user'),
        password: config.get('POSTGRES_PASSWORD', 'agent_password'),
        autoLoadEntities: true,
        synchronize: true,
        logging: config.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: parseInt(config.get('REDIS_PORT', '6379')),
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    OrganizationsModule,
    AgentsModule,
    ToolsModule,
    ExecutionsModule,
    KnowledgeModule,
    ApprovalsModule,
    EvaluationsModule,
    DatabaseModule,
  ],
})
export class AppModule {}
