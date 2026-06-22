import { supabase } from './supabase'

interface ResumableParams {
  bucket: string
  objectName: string
  file: File | Blob
  contentType: string
  onProgress?: (pct: number) => void
}

/**
 * Resumable (TUS) upload to Supabase Storage. The file bytes are sent untouched —
 * no transcoding or compression — so iPhone 4K/HEIC and large video stay original.
 */
export async function resumableUpload(params: ResumableParams): Promise<void> {
  const client = supabase
  if (!client) throw new Error('Supabase is not configured')

  const {
    data: { session },
  } = await client.auth.getSession()
  const token = session?.access_token
  if (!token) throw new Error('You must be signed in to upload')

  const projectUrl = import.meta.env.VITE_SUPABASE_URL
  // Loaded on demand so the TUS client isn't in the initial bundle.
  const tus = await import('tus-js-client')

  await new Promise<void>((resolve, reject) => {
    const upload = new tus.Upload(params.file, {
      endpoint: `${projectUrl}/storage/v1/upload/resumable`,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: { authorization: `Bearer ${token}`, 'x-upsert': 'true' },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      metadata: {
        bucketName: params.bucket,
        objectName: params.objectName,
        contentType: params.contentType,
        cacheControl: '3600',
      },
      chunkSize: 6 * 1024 * 1024, // Supabase requires a 6MB chunk size for resumable uploads.
      onError: (error) => {
        // Turn the raw TUS "413 Maximum size exceeded" into something a traveller
        // can act on. The project's global upload cap (≈50 MB on the free plan)
        // rejects oversized originals — usually long 4K videos.
        const msg = error instanceof Error ? error.message : String(error)
        if (/\b413\b|maximum size exceeded|payload too large/i.test(msg)) {
          reject(new Error('This file is too large to upload (limit ≈50 MB). Try a shorter video or a smaller photo.'))
          return
        }
        reject(error instanceof Error ? error : new Error(msg))
      },
      onProgress: (sent, total) => params.onProgress?.(total ? Math.round((sent / total) * 100) : 0),
      onSuccess: () => resolve(),
    })

    upload.findPreviousUploads().then((previous) => {
      if (previous.length > 0) upload.resumeFromPreviousUpload(previous[0])
      upload.start()
    })
  })
}
