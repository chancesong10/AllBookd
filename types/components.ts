import { BookItem } from '@/types/books'
import { User } from '@supabase/supabase-js'

export interface AddToListButtonProps {
    book: BookItem
    user: User | null
}

export interface AvatarUploadProps {
    currentAvatar?: string
    userId: string
    onUploadComplete: (url: string) => void
    onClose: () => void
}

export interface FeatureSectionProps {
    title: string;
    description: string;
    index: number;
}