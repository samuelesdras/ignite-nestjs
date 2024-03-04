import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ZodValidationPipe } from '@/pipes/zod-validation-pipe';

import { PrismaService } from '@/prisma/prisma.service';
import { z } from 'zod';

const pageQueryParamSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1));

const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema);

type PageQueryParamsSchema = z.infer<typeof pageQueryParamSchema>;

@Controller('/questions')
@UseGuards(AuthGuard('jwt'))
export class FetchRecentQuestionsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async handle(
    @Query('page', queryValidationPipe) page: PageQueryParamsSchema,
  ) {
    const perPage = 20;
    const questions = await this.prisma.question.findMany({
      take: 1,
      skip: (page - 1) * perPage,
      orderBy: {
        createdAt: 'desc',
      },
    });
    return { questions };
  }
}
