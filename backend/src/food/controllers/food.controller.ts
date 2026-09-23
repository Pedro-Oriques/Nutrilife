import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { FoodService } from '../services/food.service';
import { CreateFoodDto } from '../dtos/create-food.dto';
import { SearchFoodDto } from '../dtos/search-food.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FOOD_MESSAGES } from '../messages/food.message';
import { Food } from '../schemas/food.schema';

@ApiTags('Food')
@Controller('food')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('bearer')
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar novo alimento' })
  @ApiBody({
    description: 'Corpo da requisição para cadastrar alimento',
    required: true,
    type: CreateFoodDto,
    examples: {
      one: {
        summary: 'Exemplo de alimento',
        value: {
          name: "Frango grelhado",
          caloriesPer100g: 165,
          protein: 31,
          carbs: 0,
          fat: 3.6,
          foodRestrictions: ["Sem restrições"]
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: FOOD_MESSAGES.FOOD_CREATED,
    type: Food,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async create(
    @Body() body: CreateFoodDto | CreateFoodDto[],
  ): Promise<Food | Food[]> {
    if (Array.isArray(body)) {
      return this.foodService.createMany(body);
    }
    return this.foodService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os alimentos' })
  @ApiResponse({
    status: 200,
    description: FOOD_MESSAGES.LIST_SUCCESS,
    type: [Food],
  })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async findAll(): Promise<Food[]> {
    return this.foodService.findAll();
  }

  @Get('allowed')
  @ApiOperation({
    summary: 'Listar alimentos permitidos para o usuário (Restrições aplicadas)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de alimentos com restrições do perfil aplicadas.',
    type: [Food],
  })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async findAllowed(@Req() req: any): Promise<Food[]> {
    return this.foodService.findAllowed(req.user.userId);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Buscar alimentos por nome (com filtro de perfil)',
    description:
      'Busca alimentos excluindo alergias e incluindo dietas do perfil do usuário.',
  })
  @ApiResponse({
    status: 200,
    description: FOOD_MESSAGES.SEARCH_SUCCESS,
    type: [Food],
  })
  @ApiResponse({
    status: 400,
    description: FOOD_MESSAGES.INVALID_SEARCH_QUERY,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async search(
    @Req() req: any,
    @Query() searchFoodDto: SearchFoodDto,
  ): Promise<Food[]> {
    return this.foodService.search(searchFoodDto.query, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar um alimento pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do alimento a ser deletado' })
  @ApiResponse({
    status: 200,
    description: 'Alimento deletado com sucesso.',
    type: Food,
  })
  @ApiResponse({ status: 404, description: 'Alimento não encontrado.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  async remove(@Param('id') id: string): Promise<Food> {
    return this.foodService.remove(id);
  }
}