import Role from '#apps/users/models/role'
import { FindAll } from '#apps/users/contracts/role'
import { StoreRoleSchema } from '#apps/users/validators/role_validator'
import db from '@adonisjs/lucid/services/db'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

export default class RoleService {
  async findAll({ page = 1, size = 10 }: FindAll) {
    return Role
      .query()
      .paginate(page, size)
  }

  async create (schema: StoreRoleSchema): Promise<Role> {
    return db.transaction(async (trx: TransactionClientContract): Promise<Role> => {
      const role = await Role.create(schema, { client: trx })
      if (schema.permissions) {
        await role.related('permissions')
          .sync([...schema.permissions], undefined,trx)
      }

      return role
    })
  }
}
