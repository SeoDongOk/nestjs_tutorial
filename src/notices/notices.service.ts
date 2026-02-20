import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { Role } from '@prisma/client';

@Injectable()
export class NoticesService {
  constructor(private prisma: PrismaService) {}

  async create(createNoticeDto: CreateNoticeDto, userId: number) {
    return this.prisma.notice.create({
      data: {
        ...createNoticeDto,
        authorId: userId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [notices, total] = await Promise.all([
      this.prisma.notice.findMany({
        skip,
        take: limit,
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.notice.count(),
    ]);

    return {
      data: notices,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const notice = await this.prisma.notice.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!notice) {
      throw new NotFoundException(`공지사항 ID ${id}를 찾을 수 없습니다.`);
    }

    await this.prisma.notice.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return notice;
  }

  async update(
    id: number,
    updateNoticeDto: UpdateNoticeDto,
    userId: number,
    userRole: Role,
  ) {
    const notice = await this.findOne(id);

    // 관리자는 모든 글 수정 가능
    if (userRole !== Role.ADMIN) {
      throw new ForbiddenException('관리자만 수정할 수 있습니다.');
    }

    return this.prisma.notice.update({
      where: { id },
      data: updateNoticeDto,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: number, userId: number, userRole: Role) {
    const notice = await this.findOne(id);

    // 관리자는 모든 글 삭제 가능
    if (userRole !== Role.ADMIN) {
      throw new ForbiddenException('관리자만 삭제할 수 있습니다.');
    }

    await this.prisma.notice.delete({
      where: { id },
    });

    return { message: '공지사항이 삭제되었습니다.' };
  }
}
