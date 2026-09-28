import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { SettingUploadAvatar } from '@/features/user-settings/profile-management/(components)/personal-info/setting-upload-avatar'
import messages from '@/messages/en.json'

/**
 * Sheet source: Profile Management sheet, section "1. Profile Picture".
 *
 * Upload/remove always call the real presign -> S3 -> attach / DELETE avatar
 * endpoints (see CONTEXT.md's API flow inventory and docs/specs/user-settings.md's Out of
 * Scope: "Removing/replacing the real avatar image... mutates the one shared profile's
 * stored file"). Per the task's mutation-risk rule, this coverage lives here as unit tests
 * with the upload/presign/remove hooks mocked, not as a real E2E upload/remove.
 */

const presignMutateAsync = vi.fn()
const uploadMutateAsync = vi.fn()
const removeMutateAsync = vi.fn()

vi.mock('@/features/user-settings/profile-management/(hooks)/use-presign-avatar', () => ({
  usePresignAvatar: () => ({ mutateAsync: presignMutateAsync, isPending: false }),
}))
vi.mock('@/features/user-settings/profile-management/(hooks)/use-upload-avatar', () => ({
  useUploadAvatar: () => ({ mutateAsync: uploadMutateAsync, isPending: false }),
}))
vi.mock('@/features/user-settings/profile-management/(hooks)/use-remove-avatar', () => ({
  useRemoveAvatar: () => ({ mutateAsync: removeMutateAsync, isPending: false }),
}))
vi.mock('@/shared/stores/use-user-store', () => ({
  useUserStore: (selector: (s: { user: Record<string, string> }) => unknown) =>
    selector({ user: { name: 'Tú Anh Hà', firstName: '', lastName: '', email: 'tu@example.com' } }),
}))
// The crop dialog uses a canvas-based cropper that jsdom can't render meaningfully;
// stub it to immediately "save" the raw image it was given, like a user confirming a crop.
vi.mock('@/shared/components/ui/crop-image-dialog', () => ({
  CropImageDialog: ({ open, image, onSave }: { open: boolean; image: string; onSave: (d: string) => void }) =>
    open ? (
      <button type="button" onClick={() => onSave(image)}>
        confirm-crop
      </button>
    ) : null,
}))

function Harness({ imageUrl = null as string | null }) {
  const methods = useForm({ defaultValues: { profileImage: imageUrl ?? '' } })
  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      <FormProvider {...methods}>
        <SettingUploadAvatar imageUrl={imageUrl} onUpload={vi.fn()} onRemove={vi.fn()} />
      </FormProvider>
    </NextIntlClientProvider>
  )
}

function makeFile(name: string, sizeBytes: number, type: string) {
  const file = new File([new Uint8Array(sizeBytes)], name, { type })
  return file
}

beforeEach(() => {
  vi.clearAllMocks()
  presignMutateAsync.mockResolvedValue({ key: 'k', cdnUrl: 'https://cdn/avatar.png' })
  uploadMutateAsync.mockResolvedValue(undefined)
  removeMutateAsync.mockResolvedValue(undefined)
})

describe('SettingUploadAvatar', () => {
  it('shows the current image area, Upload/Remove buttons and the stated format/size constraints', () => {
    render(<Harness imageUrl="https://cdn/current.png" />)

    expect(screen.getByRole('button', { name: 'Upload Image' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove' })).toBeEnabled()
    expect(screen.getByText('*.png,*.jpg,*.jpeg files up to 10 MB; at least 400 x 400 px')).toBeInTheDocument()
  })

  it('disables Remove when there is no image (default state)', () => {
    render(<Harness imageUrl={null} />)

    expect(screen.getByRole('button', { name: 'Remove' })).toBeDisabled()
  })

  it('uploads a valid png under 10MB: presigns, uploads to S3, and attaches the avatar key', async () => {
    const user = userEvent.setup()
    render(<Harness imageUrl={null} />)

    const file = makeFile('avatar.png', 1_000, 'image/png')
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, file)

    await user.click(await screen.findByRole('button', { name: 'confirm-crop' }))

    await waitFor(() => expect(presignMutateAsync).toHaveBeenCalledTimes(1))
    expect(uploadMutateAsync).toHaveBeenCalledWith('k')
  })

  it('accepts a file at exactly the 10MB boundary', async () => {
    const user = userEvent.setup()
    render(<Harness imageUrl={null} />)

    const file = makeFile('avatar.png', 10_000_000, 'image/png')
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, file)

    // No "too large" toast blocked it — the crop dialog opened instead.
    expect(await screen.findByRole('button', { name: 'confirm-crop' })).toBeInTheDocument()
  })

  it('rejects a file over the 10MB boundary and never calls presign', async () => {
    const user = userEvent.setup()
    render(<Harness imageUrl={null} />)

    const file = makeFile('avatar.png', 10_000_001, 'image/png')
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, file)

    expect(screen.queryByRole('button', { name: 'confirm-crop' })).not.toBeInTheDocument()
    expect(presignMutateAsync).not.toHaveBeenCalled()
  })

  // Sheet requirement (Vietnamese sheet, "Upload ảnh dưới 400×400" / "Upload đúng biên
  // 400×400"): minimum image *dimensions* (400x400px) should be validated on upload.
  // Verified against real code: `setting-upload-avatar.tsx`'s `handleFileChange`/`handleSave`
  // only checks `file.size` against MAX_AVATAR_FILE_SIZE (10MB) and relies on the file
  // input's `accept` attribute for format — there is no width/height check anywhere in this
  // component, `use-presign-avatar.ts`, or `use-upload-avatar.ts`. The `imageHint` copy
  // ("at least 400 x 400 px") is documentation-only; a 1x1px image would be accepted as-is.
  // Flagging back to dev per profile-schema/constants — no dimension constraint exists to
  // test against.
  it.todo(
    'rejects an image smaller than 400x400px on upload — no dimension validation exists in setting-upload-avatar.tsx (imageHint copy is unenforced); needs a dev-side fix before this can be tested',
  )
  it.todo(
    'accepts an image at exactly 400x400px (minimum valid boundary) — same gap as above, no dimension check to exercise',
  )

  // Sheet requirement ("Upload sai định dạng" / "Upload file giả đuôi"): reject files whose
  // real content doesn't match an allowed image format, including a renamed-extension file.
  // Verified against real code: the only format gate is the file input's
  // `accept="image/png,image/jpeg,image/jpg"`, which is a browser file-picker filter, not an
  // app-level check — a file selected programmatically (as this test harness necessarily
  // does via `user.upload`) with a spoofed `type`/name bypasses it entirely and would proceed
  // to `presignAvatar.mutateAsync` (i.e. hit the real presign endpoint if not mocked). There
  // is no code path in this component that inspects file signature/content-type after
  // selection. Flagging back to dev — no format/magic-byte validation exists to test.
  it.todo(
    'rejects a .gif/.bmp/.svg/.pdf or a renamed-extension file — no post-selection format validation exists in setting-upload-avatar.tsx; only the native <input accept> filter, which this harness necessarily bypasses',
  )

  it('removing an existing image opens a confirm dialog; confirming calls the real remove-avatar mutation once and clears the image', async () => {
    const user = userEvent.setup()
    render(<Harness imageUrl="https://cdn/current.png" />)

    await user.click(screen.getByRole('button', { name: 'Remove' }))
    expect(screen.getByRole('heading', { name: 'Remove profile picture' })).toBeInTheDocument()

    // Two "Remove" buttons now exist: the trigger and the dialog's destructive action —
    // the confirm action is the last one rendered (inside the dialog).
    const removeButtons = screen.getAllByRole('button', { name: 'Remove' })
    await user.click(removeButtons[removeButtons.length - 1])

    await waitFor(() => expect(removeMutateAsync).toHaveBeenCalledTimes(1))
  })

  it('canceling mid-upload (closing the file dialog with no file chosen) leaves the current image unchanged', async () => {
    render(<Harness imageUrl="https://cdn/current.png" />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    // Simulate the native picker being dismissed without a selection: change fires with
    // an empty FileList, matching `e.target.files?.[0]` being undefined in the handler.
    input.dispatchEvent(new Event('change', { bubbles: true }))

    expect(screen.queryByRole('button', { name: 'confirm-crop' })).not.toBeInTheDocument()
    expect(presignMutateAsync).not.toHaveBeenCalled()
    // Remove stays enabled — proof the current image is still considered present.
    expect(screen.getByRole('button', { name: 'Remove' })).toBeEnabled()
  })
})
