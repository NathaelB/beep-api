import Role from '#apps/users/models/role'
import { FindAll } from '#apps/users/contracts/role'
import { StoreRoleSchema, UpdateRoleSchema } from '#apps/users/validators/role_validator'
import db from '@adonisjs/lucid/services/db'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import Permission from '#apps/users/models/permission'

export default class PermissionService {
  async findAll({ page = 1, limit = 10 }: FindAll) {
    return Permission.query()
      .paginate(page, limit)
  }

  async findById(permissionId: Permission['id']) {
    return Permission.query()
      .where('id', permissionId)
      .firstOrFail()
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

  async update (role: Role, schema: UpdateRoleSchema): Promise<Role> {
    return db.transaction(async (trx: TransactionClientContract): Promise<Role> => {
      await role.merge(schema).save()

      if (schema.permissions) {
        await role.related('permissions')
          .sync([...schema.permissions], undefined,trx)
      }

      return role
    })
  }

  async destroy (role: Role): Promise<void> {
    await role.delete()
  }
}
