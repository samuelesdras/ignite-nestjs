import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '@/auth/current-user-decorator';
import { UserPayload } from '@/auth/jwt.strategy';
import { ZodValidationPipe } from '@/pipes/zod-validation-pipe';
import { PrismaService } from '@/prisma/prisma.service';
import { z } from 'zod';

const createQuestionBodySchema = z.object({
  title: z.string(),
  content: z.string(),
});

const bodyValidationPipe = new ZodValidationPipe(createQuestionBodySchema);

type CreateQuestionBodySchema = z.infer<typeof createQuestionBodySchema>;

@Controller('/questions')
@UseGuards(AuthGuard('jwt'))
export class CreateQuestionController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async handle(
    @Body(bodyValidationPipe)
    body: CreateQuestionBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { title, content } = body;
    const userId = user.sub;

    const slug = this.convertToSlug(title);

    await this.prisma.question.create({
      data: {
        authorId: userId,
        title,
        content,
        slug: slug,
      },
    });
  }

  private convertToSlug(title: string): string {
    return title
      .normalize('NFD') // Normalize to decomposed form
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .toLowerCase() // Convert to lowercase
      .replace(/[^\w\s-]/g, '') // Remove non-word characters except spaces and hyphens
      .replace(/[\s_]+/g, '-') // Replace spaces and underscores with a hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }
}
