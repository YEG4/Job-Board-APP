import { env } from '@/data/env/server';
import { inngest } from '../client';
import { Webhook } from 'svix';
import { NonRetriableError } from 'inngest';
import { deleteUser, inserUser, updateUser } from '@/features/users/db/user';
import { inserUserNotificationSettings } from '@/features/users/db/userNotificationSettings';

function verifyWebhook({
  raw,
  headers,
}: {
  raw: string;
  headers: Record<string, string>;
}) {
  return new Webhook(env.CLERK_WEBHOOK_SECRET).verify(raw, headers);
}

export const clerkCreateUser = inngest.createFunction(
  { id: 'clerk/create-db-user', name: 'Clerk - Create DB User' },
  { event: 'clerk/user.created' },
  async ({ event, step }) => {
    await step.run('verify-webhook', async () => {
      try {
        verifyWebhook(event.data);
      } catch {
        throw new NonRetriableError('Invalid webhook.');
      }
    });
    const userId = await step.run('creat-user', async () => {
      const userData = event.data.data;
      const email = userData.email_addresses.find(
        (email) => email.id === userData.primary_email_address_id
      );

      if (email == null) {
        throw new NonRetriableError('No primary email address found.');
      }

      await inserUser({
        id: userData.id,
        email: email.email_address,
        name: `${userData.first_name} ${userData.last_name}`,
        imageUrl: userData.image_url,
        createdAt: new Date(userData.created_at),
        updatedAt: new Date(userData.updated_at),
      });

      return userData.id;
    });

    await step.run('create-user-notification-settings', async () => {
      await inserUserNotificationSettings({ userId });
    });
  }
);

export const clerkUpdateUser = inngest.createFunction(
  { id: 'clerk/update-db-user', name: 'Clerk - Update DB User' },
  { event: 'clerk/user.updated' },
  async ({ event, step }) => {
    await step.run('verify-webhook', async () => {
      try {
        verifyWebhook(event.data);
      } catch {
        throw new NonRetriableError('Invalid webhook.');
      }
    });
    await step.run('update-user', async () => {
      const userData = event.data.data;
      const email = userData.email_addresses.find(
        (email) => email.id === userData.primary_email_address_id
      );

      if (email == null) {
        throw new NonRetriableError('No primary email address found.');
      }

      await updateUser(userData.id, {
        email: email.email_address,
        name: `${userData.first_name} ${userData.last_name}`,
        imageUrl: userData.image_url,
        updatedAt: new Date(userData.updated_at),
      });
    });
  }
);
export const clerkDeleteUser = inngest.createFunction(
  { id: 'clerk/delete-db-user', name: 'Clerk - Delete DB User' },
  { event: 'clerk/user.deleted' },
  async ({ event, step }) => {
    await step.run('verify-webhook', async () => {
      try {
        verifyWebhook(event.data);
      } catch {
        throw new NonRetriableError('Invalid webhook.');
      }
    });
    await step.run('delete-user', async () => {
      const { id } = event.data.data;
      if (id == null) {
        throw new NonRetriableError('No primary email address found.');
      }

      await deleteUser(id);
    });
  }
);
