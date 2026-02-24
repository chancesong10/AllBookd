// app/components/AvatarUpload.tsx
'use client'

import { useState, useRef } from 'react'
import AvatarEditor from 'react-avatar-editor'
import { useDropzone } from 'react-dropzone'
import { supabase } from '@/lib/supabase/client'
import { AvatarUploadProps } from '@/types/components'

export default function AvatarUpload({ currentAvatar, userId, onUploadComplete, onClose }: AvatarUploadProps) {
  const [image, setImage] = useState<File | null>(null)
  const [zoom, setZoom] = useState(1)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const editorRef = useRef<AvatarEditor>(null)

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setImage(acceptedFiles[0])
        setError('')
      }
    },
    onDropRejected: (rejectedFiles) => {
      setError('File must be an image under 5MB')
    }
  })

  const handleSave = async () => {
    if (!editorRef.current || !image) return

    setIsUploading(true)
    setError('')

    try {
      // Get the cropped image as a data URL
      const canvas = editorRef.current.getImageScaledToCanvas()
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9)

      

      // Convert data URL to blob
      const blob = await fetch(dataUrl).then(res => res.blob())

      // Generate a unique filename
      const fileExt = 'jpg'
      const fileName = `${userId}-${Date.now()}.${fileExt}`
    // In the handleSave function, ensure the file path includes the user ID folder
       const filePath = `avatars/${userId}/${fileName}`

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, blob, {
        contentType: 'image/jpeg',
        upsert: true
    })

      if (uploadError) throw uploadError

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update the user's profile with the new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId)

      if (updateError) throw updateError

      onUploadComplete(publicUrl)
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to upload avatar')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-800 w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Change Avatar</h2>
          <button 
            onClick={onClose}
            className="text-neutral-500 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!image ? (
            // Dropzone
            <div
              {...getRootProps()}
              className="border-2 border-dashed border-neutral-700 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500/50 transition-colors"
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-3">
                <svg className="w-12 h-12 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-neutral-300">Drag & drop an image here, or click to select</p>
                <p className="text-sm text-neutral-500">Supports: JPG, PNG, GIF, WebP (max 5MB)</p>
              </div>
            </div>
          ) : (
            // Editor
            <div className="space-y-4">
              <div className="flex justify-center">
                <AvatarEditor
                  ref={editorRef}
                  image={image}
                  width={250}
                  height={250}
                  border={50}
                  borderRadius={125}
                  color={[0, 0, 0, 0.6]}
                  scale={zoom}
                  rotate={0}
                  className="rounded-lg"
                />
              </div>

              {/* Zoom Slider */}
              <div className="space-y-2">
                <label className="text-sm text-neutral-400">Zoom</label>
                <input
                  type="range"
                  min="1"
                  max="2"
                  step="0.01"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setImage(null)}
                  className="flex-1 px-4 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition-colors"
                >
                  Choose Different
                </button>
                <button
                  onClick={handleSave}
                  disabled={isUploading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 transition-colors"
                >
                  {isUploading ? 'Saving...' : 'Save Avatar'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}