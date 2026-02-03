import { supabase } from './supabaseClient';

export const MAX_FILE_SIZE = 500 * 1024; // 500KB
export const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

export interface PhotoUploadResult {
  success: boolean;
  photoUrl?: string;
  error?: string;
  fileSize?: number;
}

export const validateImage = (file: { size?: number; type?: string }): { valid: boolean; error?: string } => {
  if (file.size && file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Image is too large (${(file.size / 1024).toFixed(0)}KB). Maximum size is 500KB.`,
    };
  }
  
  if (file.type && !ALLOWED_FORMATS.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid image format. Please use JPEG, PNG, or WebP.',
    };
  }
  
  return { valid: true };
};

export const uploadPhoto = async (memberId: string, file: { uri: string; type?: string; name?: string; size?: number }): Promise<PhotoUploadResult> => {
  try {
    const validation = validateImage(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const fileName = `${memberId}/${Date.now()}.jpg`;
    
    const { error: uploadError } = await supabase.storage
      .from('member-photos')
      .upload(fileName, file as any, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('member-photos')
      .getPublicUrl(fileName);

    await supabase
      .from('member_profiles')
      .update({ photo_url: publicUrl, last_updated: new Date().toISOString() })
      .eq('member_id', memberId);

    return { success: true, photoUrl: publicUrl, fileSize: file.size };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deletePhoto = async (photoUrl: string, memberId: string): Promise<boolean> => {
  try {
    const urlParts = photoUrl.split('/');
    const filePath = `${memberId}/${urlParts[urlParts.length - 1]}`;
    
    await supabase.storage.from('member-photos').remove([filePath]);
    
    await supabase
      .from('member_profiles')
      .update({ photo_url: null, last_updated: new Date().toISOString() })
      .eq('member_id', memberId);
    
    return true;
  } catch (error) {
    return false;
  }
};
