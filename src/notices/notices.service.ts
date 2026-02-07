import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';

@Injectable()
export class NoticesService {
  constructor(private prisma: PrismaService) {}

  // 공지사항 생성
  async create(createNoticeDto: CreateNoticeDto) {
    // TODO: 나중에 JWT에서 userId 가져올 예정
    const tempUserId = 1; // 임시로 하드코딩

    return this.prisma.notice.create({
      data: {
        ...createNoticeDto,
        authorId: tempUserId,
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

  // 공지사항 목록 조회 (페이징)
  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [notices, total] = await Promise.all([
      this.prisma.notice.findMany({
        skip,
        take: limit,
        orderBy: [
          { isPinned: 'desc' }, // 고정 공지 먼저
          { createdAt: 'desc' }, // 최신순
        ],
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

  // 공지사항 상세 조회 (조회수 증가)
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

    // 조회수 증가
    await this.prisma.notice.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return notice;
  }

  // 공지사항 수정
  async update(id: number, updateNoticeDto: UpdateNoticeDto) {
    // 공지사항 존재 확인
    await this.findOne(id);

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

  // 공지사항 삭제
  async remove(id: number) {
    // 공지사항 존재 확인
    await this.findOne(id);

    await this.prisma.notice.delete({
      where: { id },
    });

    return { message: '공지사항이 삭제되었습니다.' };
  }
}
