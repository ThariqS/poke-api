/**
 * Move API module
 */

import { APIClient } from '../client';
import {
  Move,
  MoveDamageClass,
  MoveCategory,
  MoveLearnMethod,
  MoveTarget,
  NamedAPIResourceList,
} from '../types';

/**
 * Move API methods
 */
export class MoveAPI {
  constructor(private client: APIClient) {}

  /**
   * Get a move by name or ID
   * @param nameOrId - Move name (e.g., "thunderbolt") or ID
   */
  async getMove(nameOrId: string | number): Promise<Move> {
    return this.client.getResource<Move>('move', nameOrId);
  }

  /**
   * Get a paginated list of moves
   * @param options - Pagination options
   */
  async listMoves(options?: {
    limit?: number;
    offset?: number;
  }): Promise<NamedAPIResourceList> {
    return this.client.getList<NamedAPIResourceList>('move', options);
  }

  /**
   * Get all moves (automatically handles pagination)
   * Warning: This will make a large request
   */
  async getAllMoves(): Promise<NamedAPIResourceList> {
    return this.client.getList<NamedAPIResourceList>('move', { limit: 10000 });
  }

  /**
   * Get move damage class by name or ID
   * @param nameOrId - Damage class name (e.g., "physical") or ID
   */
  async getMoveDamageClass(nameOrId: string | number): Promise<MoveDamageClass> {
    return this.client.getResource<MoveDamageClass>('move-damage-class', nameOrId);
  }

  /**
   * Get a paginated list of move damage classes
   * @param options - Pagination options
   */
  async listMoveDamageClasses(options?: {
    limit?: number;
    offset?: number;
  }): Promise<NamedAPIResourceList> {
    return this.client.getList<NamedAPIResourceList>('move-damage-class', options);
  }

  /**
   * Get move category by name or ID
   * @param nameOrId - Category name or ID
   */
  async getMoveCategory(nameOrId: string | number): Promise<MoveCategory> {
    return this.client.getResource<MoveCategory>('move-category', nameOrId);
  }

  /**
   * Get a paginated list of move categories
   * @param options - Pagination options
   */
  async listMoveCategories(options?: {
    limit?: number;
    offset?: number;
  }): Promise<NamedAPIResourceList> {
    return this.client.getList<NamedAPIResourceList>('move-category', options);
  }

  /**
   * Get move learn method by name or ID
   * @param nameOrId - Learn method name (e.g., "level-up") or ID
   */
  async getMoveLearnMethod(nameOrId: string | number): Promise<MoveLearnMethod> {
    return this.client.getResource<MoveLearnMethod>('move-learn-method', nameOrId);
  }

  /**
   * Get a paginated list of move learn methods
   * @param options - Pagination options
   */
  async listMoveLearnMethods(options?: {
    limit?: number;
    offset?: number;
  }): Promise<NamedAPIResourceList> {
    return this.client.getList<NamedAPIResourceList>('move-learn-method', options);
  }

  /**
   * Get move target by name or ID
   * @param nameOrId - Target name or ID
   */
  async getMoveTarget(nameOrId: string | number): Promise<MoveTarget> {
    return this.client.getResource<MoveTarget>('move-target', nameOrId);
  }

  /**
   * Get a paginated list of move targets
   * @param options - Pagination options
   */
  async listMoveTargets(options?: {
    limit?: number;
    offset?: number;
  }): Promise<NamedAPIResourceList> {
    return this.client.getList<NamedAPIResourceList>('move-target', options);
  }
}
