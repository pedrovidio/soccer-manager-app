import { supabase } from './client';
import { appLogger } from '../logger';

type UploadImageOptions = {
  bucket: 'athlete-photos' | 'group-photos';
  ownerId: string;
  uri: string;
};

export async function uploadImageToSupabaseStorage({ bucket, ownerId, uri }: UploadImageOptions): Promise<string> {
  const startedAt = Date.now();
  const extension = uri.split('.').pop()?.split('?')[0] || 'jpg';
  const path = `${ownerId}/${Date.now()}.${extension}`;

  try {
    appLogger.debug('[SupabaseStorage] -> upload', { bucket, path });
    const response = await fetch(uri);
    const blob = await response.blob();

    const { error } = await supabase.storage.from(bucket).upload(path, blob, {
      contentType: blob.type || 'image/jpeg',
      upsert: true,
    });
    if (error) throw error;

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    appLogger.debug('[SupabaseStorage] <- uploaded', { bucket, path, durationMs: Date.now() - startedAt });
    return data.publicUrl;
  } catch (error) {
    appLogger.error('[SupabaseStorage] upload failed', error, { bucket, path, durationMs: Date.now() - startedAt });
    throw error;
  }
}
