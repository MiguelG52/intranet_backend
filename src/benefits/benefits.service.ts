import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBenefitDto } from './dto/create-benefit.dto';
import { UpdateBenefitDto } from './dto/update-benefit.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Benefit } from './entities/benefit.entity';
import { Repository } from 'typeorm';
import { QueryParamsDto } from 'src/common/dto/query-params.dto';
import { last } from 'rxjs';

@Injectable()
export class BenefitsService {

  constructor(
    @InjectRepository(Benefit)
    private readonly benefitRepository:Repository<Benefit>,
  ) {}


  /**
   * Crea un nuevo beneficio.
   * Valida que no exista otro beneficio con el mismo título para el mismo país.
   * @param createBenefitDto Datos del beneficio a crear.
   * @returns Mensaje de éxito.
   */
  async create(createBenefitDto: CreateBenefitDto) {
      const {title, countryCode} = createBenefitDto;
      const exists:boolean = await this.benefitRepository.existsBy({title:title, countryCode:countryCode})
      if(exists){
        return new ConflictException("Ya existe un beneficio con ese título para ese país");
      }
      const newBenefit = this.benefitRepository.create(createBenefitDto);
      await this.benefitRepository.save(newBenefit);
      return {message:'Beneficio creado correctamente'};
  }

  /**
   * Obtiene una lista paginada de beneficios.
   * Permite filtrar por búsqueda y ordenar por diferentes columnas.
   * @param params Parámetros de paginación, búsqueda y ordenamiento.
   * @returns Lista de beneficios y metadatos de paginación.
   */
  async findAll(params:QueryParamsDto) {
    
    const page = Number.isFinite(Number(params.page)) && Number(params.page) > 0 ? Number(params.page) : 1;
    const limit = Number.isFinite(Number(params.limit)) && Number(params.limit) > 0 ? Number(params.limit) : 10;
    const search = (params.search ?? '').trim();
    const order = (params.order ?? 'ASC').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const orderBy = (params.orderBy ?? 'title').trim();
    const skip = (page - 1) * limit;

    const validSort = new Set(['title', 'countryCode', 'createdAt', 'updatedAt']);
    const sortColumn = validSort.has(orderBy) ? `benefit.${orderBy}` : 'benefit.title';

    const queryBuilder = this.benefitRepository.createQueryBuilder('benefit');
    if (search) {
      queryBuilder.where('benefit.title ILIKE :search OR benefit.description ILIKE :search', { search: `%${search}%` });
    }
    queryBuilder.orderBy(sortColumn, order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC');
    queryBuilder.skip(skip).take(limit);
    
    const [data, total] = await queryBuilder.getManyAndCount();

    console.log(total)
    
    if(total === 0){
      return {
        data: [],
        message:"No se encontraron beneficios",
      }
    }


    return {
      data,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
        order,
        orderBy: sortColumn.replace('benefit.', ''),
        search: search || null,
      },
    };
  }

  /**
   * Busca un beneficio por su ID.
   * @param id ID del beneficio (UUID).
   * @returns La entidad del beneficio encontrado.
   * @throws NotFoundException Si el beneficio no existe.
   */
  async findOne(id: string) {
    const benefit = await this.benefitRepository.findOne({ where: { benefitId: id } });
    if (!benefit) {
      throw new NotFoundException(`Beneficio con ID '${id}' no encontrado.`);
    }
    return benefit;
  }

  /**
   * Actualiza un beneficio existente.
   * No permite modificar el ID del beneficio.
   * @param id ID del beneficio a actualizar.
   * @param updateBenefitDto Datos a actualizar.
   * @returns Mensaje de éxito.
   * @throws NotFoundException Si el beneficio no existe.
   */
  async update(id: string, updateBenefitDto: UpdateBenefitDto) {
    // Evitar que se actualice el ID si viene en el DTO
    if (updateBenefitDto['benefitId']) {
      delete updateBenefitDto['benefitId'];
    }

    const result = await this.benefitRepository.update(id, updateBenefitDto);

    if (result.affected === 0) {
      throw new NotFoundException(`Beneficio con ID '${id}' no encontrado.`);
    }

    return { message: 'Beneficio actualizado correctamente' };
  }

  /**
   * Elimina un beneficio por su ID.
   * @param id ID del beneficio a eliminar.
   * @returns Mensaje de éxito.
   * @throws NotFoundException Si el beneficio no existe.
   */
  async remove(id: string) {
    const result = await this.benefitRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Beneficio con ID '${id}' no encontrado.`);
    }

    return { message: 'Beneficio eliminado correctamente' };
  }
}
