'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useFormContext } from 'react-hook-form'
import { Download } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { CropImageDialog } from '@/shared/components/ui/crop-image-dialog'
import { getUserInitials } from '@/lib/utils'
import { useUserStore } from '@/shared/stores/use-user-store'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/shared/components/ui/alert-dialog'
import { usePresignAvatar } from '../../(hooks)/use-presign-avatar'
import { useUploadAvatar } from '../../(hooks)/use-upload-avatar'
import { useRemoveAvatar } from '../../(hooks)/use-remove-avatar'

interface SettingUploadAvatarProps {
  onUpload?: (cdnUrl: string) => void
  onRemove?: () => void
  imageUrl?: string | null
}

const MAX_AVATAR_FILE_SIZE = 10_000_000

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/png'
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

export function SettingUploadAvatar({
  onUpload,
  onRemove,
  imageUrl,
}: SettingUploadAvatarProps) {
  const t = useTranslations('settings')
  const { setValue } = useFormContext()
  const user = useUserStore(state => state.user)
  const displayName = user.name || [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || ''
  const initials = getUserInitials(displayName || user.email)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [rawImage, setRawImage] = useState<string | null>(null)
  const [cropOpen, setCropOpen] = useState(false)
  const [filename, setFilename] = useState('')

  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false)

  const presignAvatar = usePresignAvatar()
  const uploadAvatar = useUploadAvatar()
  const removeAvatar = useRemoveAvatar()
  const isPending = presignAvatar.isPending || uploadAvatar.isPending || removeAvatar.isPending

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_AVATAR_FILE_SIZE) {
      toast.error(t('imageErrorTooLarge'))
      setRawImage(null)
      setCropOpen(false)
      setFilename('')
      e.target.value = ''
      return
    }

    setFilename(file.name)
    const reader = new FileReader()
    reader.onload = () => {
      setRawImage(reader.result as string)
      setCropOpen(true)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleSave = async (croppedDataUrl: string) => {
    const blob = dataUrlToBlob(croppedDataUrl)

    if (blob.size > MAX_AVATAR_FILE_SIZE) {
      toast.error(t('imageErrorTooLarge'))
      return
    }

    setCropOpen(false)
    const { key, cdnUrl } = await presignAvatar.mutateAsync({ filename, blob })
    await uploadAvatar.mutateAsync(key)
    onUpload?.(cdnUrl)
    setValue('profileImage', cdnUrl)
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex items-center gap-6">
        <Avatar key={imageUrl || 'no-avatar'} className="size-20 shrink-0">
          <AvatarImage src={imageUrl || undefined} alt={displayName || t('profilePicture')} />
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-sm font-medium text-foreground">{t('profilePicture')}</h3>
          <div className="flex flex-col sm:flex-row gap-3 mt-3.5">
            <Button
              variant="outline-primary"
              size="default"
              disabled={isPending}
              onClick={() => fileInputRef.current?.click()}
            >
              {t('uploadImage')}
              <Download className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="default"
              disabled={!imageUrl || isPending}
              onClick={() => setConfirmRemoveOpen(true)}
              className='text-primary'
            >
              {t('removeImage')}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3.5">{t('imageHint')}</p>
        </div>
      </div>

      {rawImage && (
        <CropImageDialog
          open={cropOpen}
          image={rawImage}
          onClose={() => setCropOpen(false)}
          onSave={handleSave}
        />
      )}

      <AlertDialog open={confirmRemoveOpen} onOpenChange={setConfirmRemoveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('removeImageTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('removeImageDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              isLoading={removeAvatar.isPending}
              disabled={removeAvatar.isPending}
              onClick={async () => {
                await removeAvatar.mutateAsync()
                setConfirmRemoveOpen(false)
                onRemove?.()
                setValue('profileImage', '')
              }}
            >
              {t('removeImage')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
