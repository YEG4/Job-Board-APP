import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { createdAt, updatedAt } from '../schemaHelpers';
import { relations } from 'drizzle-orm';
import { OrganizationUserSettingsTable } from './organizationUserSettings';
import { JobListingTable } from './jobListing';

export const OrganizationTable = pgTable('organizations', {
  id: varchar().primaryKey(),
  name: varchar().notNull(),
  imageUrl: varchar(),
  createdAt,
  updatedAt,
});

export const organizationRelations = relations(
  OrganizationTable,
  ({ many }) => ({
    organization: many(OrganizationUserSettingsTable),
    applications: many(JobListingTable),
  })
);
