import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.repo.createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findAll(organizationId: string): Promise<User[]> {
    return this.repo.find({ where: { organizationId } });
  }

  async create(data: { email: string; name: string; password: string; organizationId: string; role?: any }): Promise<User> {
    const existing = await this.repo.findOne({ where: { email: data.email } });
    if (existing) throw new ConflictException('Email already exists');

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = this.repo.create({ ...data, passwordHash });
    return this.repo.save(user);
  }

  async update(id: string, orgId: string, data: Partial<User>): Promise<User> {
    const user = await this.repo.findOne({ where: { id, organizationId: orgId } });
    if (!user) throw new NotFoundException('User not found');
    Object.assign(user, data);
    return this.repo.save(user);
  }
}
