import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(createCommentDto: CreateCommentDto, userId: number) {
    const { noticeId, content } = createCommentDto;

    const notice = await this.prisma.notice.findUnique({
      where: { id: noticeId },
    });

    if (!notice) {
      throw new NotFoundException(`게시글 ID ${noticeId}를 찾을 수 없습니다.`);
    }

    return this.prisma.comment.create({
      data: {
        content,
        noticeId,
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

  async findByNoticeId(noticeId: number) {
    return this.prisma.comment.findMany({
      where: { noticeId },
      orderBy: { createdAt: 'desc' },
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

  async remove(id: number, userId: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException(`댓글 ID ${id}를 찾을 수 없습니다.`);
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('본인의 댓글만 삭제할 수 있습니다.');
    }

    await this.prisma.comment.delete({
      where: { id },
    });

    return { message: '댓글이 삭제되었습니다.' };
  }
}
