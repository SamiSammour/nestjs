import { SetMetadata } from '@nestjs/common';

export const OwnerRelation = (relation: string) => SetMetadata('ownerRelation', relation);
