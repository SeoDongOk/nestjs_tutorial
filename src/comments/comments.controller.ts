import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(@Body() createCommentDto: CreateCommentDto, @GetUser() user) {
    return this.commentsService.create(createCommentDto, user.sub);
  }

  @Get('notice/:noticeId')
  findByNoticeId(@Param('noticeId', ParseIntPipe) noticeId: number) {
    return this.commentsService.findByNoticeId(noticeId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() user) {
    return this.commentsService.remove(id, user.sub);
  }
}
