import { decode } from 'base64-arraybuffer';
import { File } from 'expo-file-system';
import { supabase } from './client';
import { appLogger } from '../logger';

type UploadImageOptions = {
  bucket: 'athlete-photos' | 'group-photos';
  ownerId?: string;
  uri: string;
};

const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

export async function uploadImageToSupabaseStorage({ bucket, ownerId, uri }: UploadImageOptions): Promise<string> {
  const startedAt = Date.now();
  const extension = uri.split('.').pop()?.split('?')[0]?.toLowerCase() || 'jpg';
  let path: string | undefined;
  let authUserId: string | undefined;

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    authUserId = sessionData.session?.user.id;
    if (!authUserId) throw new Error('Supabase session is required to upload images');

    const storageOwnerId = ownerId && ownerId === authUserId ? ownerId : authUserId;
    path = `${storageOwnerId}/${Date.now()}.${extension}`;
    appLogger.debug('[SupabaseStorage] -> upload', { bucket, path, authUserId, ownerId });

    const file = new File(uri);
    const base64FileData = await file.base64();

    const { error } = await supabase.storage.from(bucket).upload(path, decode(base64FileData), {
      contentType: file.type || CONTENT_TYPE_BY_EXTENSION[extension] || 'image/jpeg',
      upsert: false,
    });
    if (error) throw error;

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    appLogger.debug('[SupabaseStorage] <- uploaded', { bucket, path, durationMs: Date.now() - startedAt });
    return data.publicUrl;
  } catch (error) {
    appLogger.error('[SupabaseStorage] upload failed', error, {
      bucket,
      path,
      authUserId,
      ownerId,
      durationMs: Date.now() - startedAt,
    });
    throw error;
  }
}
