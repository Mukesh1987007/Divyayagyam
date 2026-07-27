import { createAdminClient } from './admin'
import { v4 as uuidv4 } from 'uuid'

export async function ensureBucketExists() {
  const supabase = await createAdminClient()
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    if (listError) {
// console.error('Error listing buckets:', listError) (removed for production)
      // fallback: try creating anyway
    }

    const exists = buckets?.some(b => b.name === 'images')
    if (!exists) {
      const { error: createError } = await supabase.storage.createBucket('images', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
      })
      if (createError) {
// console.error('Error creating bucket:', createError) (removed for production)
        return false
      }
      
      // Update bucket policy to allow public access if needed
      // By default public: true makes all objects accessible publicly in Supabase
    }
    return true
  } catch (err) {
// console.error('ensureBucketExists failed:', err) (removed for production)
    return false
  }
}

export async function uploadToSupabase(fileBuffer: Buffer, fileName: string, mimeType: string) {
  const supabase = await createAdminClient()
  const fileExt = fileName.split('.').pop() || 'jpg'
  const uniqueId = uuidv4()
  
  let finalBuffer = fileBuffer;
  let finalMimeType = mimeType;
  let finalExt = fileExt.toLowerCase();

  const filePath = `uploads/${uniqueId}.${finalExt}`

  const { data, error } = await supabase.storage
    .from('images')
    .upload(filePath, finalBuffer, {
      contentType: finalMimeType,
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw error
  }

  const { data: urlData } = supabase.storage
    .from('images')
    .getPublicUrl(filePath)

  return {
    path: filePath,
    publicUrl: urlData.publicUrl,
  }
}

export async function deleteFromSupabase(filePathOrUrl: string) {
  const supabase = await createAdminClient()
  
  let filePath = filePathOrUrl
  if (filePathOrUrl.includes('/images/object/public/images/')) {
    filePath = filePathOrUrl.split('/images/object/public/images/')[1]
  }

  const { error } = await supabase.storage
    .from('images')
    .remove([filePath])

  if (error) {
// console.error('Error deleting file from Supabase storage:', error) (removed for production)
    return false
  }
  return true
}
