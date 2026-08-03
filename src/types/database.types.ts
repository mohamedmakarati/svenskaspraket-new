/**
 * SvenskaSpråket — Supabase database types
 *
 * Hand-maintained to match supabase/migrations/*.sql
 * Regenerate from live project (recommended after schema changes):
 *
 *   npx supabase gen types typescript --project-id YOUR_PROJECT_REF > src/types/database.types.ts
 *
 * Or with linked local project:
 *   npx supabase gen types typescript --linked > src/types/database.types.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = 'admin' | 'editor' | 'viewer';
export type PreferredLanguage = 'sv' | 'en' | 'ar';
export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2';
export type ContentStatus = 'draft' | 'published' | 'archived';
export type QuizDifficulty = 'easy' | 'medium' | 'hard';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          role: UserRole;
          preferred_language: PreferredLanguage;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          role?: UserRole;
          preferred_language?: PreferredLanguage;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          role?: UserRole;
          preferred_language?: PreferredLanguage;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      verbs: {
        Row: {
          id: string;
          slug: string;
          infinitive: string;
          imperative: string | null;
          present: string | null;
          preterite: string | null;
          supine: string | null;
          verb_group: string | null;
          cefr_level: CefrLevel;
          meaning_en: string | null;
          meaning_ar: string | null;
          example_sv: string | null;
          example_en: string | null;
          example_ar: string | null;
          image_path: string | null;
          status: ContentStatus;
          seo_title_sv: string | null;
          seo_title_en: string | null;
          seo_title_ar: string | null;
          seo_description_sv: string | null;
          seo_description_en: string | null;
          seo_description_ar: string | null;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          infinitive: string;
          imperative?: string | null;
          present?: string | null;
          preterite?: string | null;
          supine?: string | null;
          verb_group?: string | null;
          cefr_level: CefrLevel;
          meaning_en?: string | null;
          meaning_ar?: string | null;
          example_sv?: string | null;
          example_en?: string | null;
          example_ar?: string | null;
          image_path?: string | null;
          status?: ContentStatus;
          seo_title_sv?: string | null;
          seo_title_en?: string | null;
          seo_title_ar?: string | null;
          seo_description_sv?: string | null;
          seo_description_en?: string | null;
          seo_description_ar?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['verbs']['Insert']>;
        Relationships: [];
      };
      vocabulary: {
        Row: {
          id: string;
          slug: string;
          word_sv: string;
          meaning_en: string | null;
          meaning_ar: string | null;
          example_sv: string | null;
          example_en: string | null;
          example_ar: string | null;
          word_class: string | null;
          cefr_level: CefrLevel | null;
          category: string | null;
          image_path: string | null;
          status: ContentStatus;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          word_sv: string;
          meaning_en?: string | null;
          meaning_ar?: string | null;
          example_sv?: string | null;
          example_en?: string | null;
          example_ar?: string | null;
          word_class?: string | null;
          cefr_level?: CefrLevel | null;
          category?: string | null;
          image_path?: string | null;
          status?: ContentStatus;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['vocabulary']['Insert']>;
        Relationships: [];
      };
      lessons: {
        Row: {
          id: string;
          slug: string;
          title_sv: string;
          title_en: string | null;
          title_ar: string | null;
          summary_sv: string | null;
          summary_en: string | null;
          summary_ar: string | null;
          content_sv: string | null;
          content_en: string | null;
          content_ar: string | null;
          cefr_level: CefrLevel | null;
          category: string | null;
          featured_image_path: string | null;
          sort_order: number;
          status: ContentStatus;
          seo_title_sv: string | null;
          seo_title_en: string | null;
          seo_title_ar: string | null;
          seo_description_sv: string | null;
          seo_description_en: string | null;
          seo_description_ar: string | null;
          created_by: string | null;
          updated_by: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title_sv: string;
          title_en?: string | null;
          title_ar?: string | null;
          summary_sv?: string | null;
          summary_en?: string | null;
          summary_ar?: string | null;
          content_sv?: string | null;
          content_en?: string | null;
          content_ar?: string | null;
          cefr_level?: CefrLevel | null;
          category?: string | null;
          featured_image_path?: string | null;
          sort_order?: number;
          status?: ContentStatus;
          seo_title_sv?: string | null;
          seo_title_en?: string | null;
          seo_title_ar?: string | null;
          seo_description_sv?: string | null;
          seo_description_en?: string | null;
          seo_description_ar?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['lessons']['Insert']>;
        Relationships: [];
      };
      exercises: {
        Row: {
          id: string;
          lesson_id: string;
          instruction_sv: string | null;
          instruction_en: string | null;
          instruction_ar: string | null;
          exercise_type: string;
          exercise_data: Json;
          sort_order: number;
          status: ContentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          instruction_sv?: string | null;
          instruction_en?: string | null;
          instruction_ar?: string | null;
          exercise_type?: string;
          exercise_data?: Json;
          sort_order?: number;
          status?: ContentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['exercises']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'exercises_lesson_id_fkey';
            columns: ['lesson_id'];
            referencedRelation: 'lessons';
            referencedColumns: ['id'];
          },
        ];
      };
      quiz_questions: {
        Row: {
          id: string;
          lesson_id: string | null;
          vocabulary_id: string | null;
          verb_id: string | null;
          question_sv: string;
          question_en: string | null;
          question_ar: string | null;
          answer_data: Json;
          explanation_sv: string | null;
          explanation_en: string | null;
          explanation_ar: string | null;
          difficulty: QuizDifficulty | null;
          status: ContentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lesson_id?: string | null;
          vocabulary_id?: string | null;
          verb_id?: string | null;
          question_sv: string;
          question_en?: string | null;
          question_ar?: string | null;
          answer_data?: Json;
          explanation_sv?: string | null;
          explanation_en?: string | null;
          explanation_ar?: string | null;
          difficulty?: QuizDifficulty | null;
          status?: ContentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['quiz_questions']['Insert']>;
        Relationships: [];
      };
      media: {
        Row: {
          id: string;
          storage_path: string;
          file_name: string;
          mime_type: string;
          file_size: number;
          alt_text_sv: string | null;
          alt_text_en: string | null;
          alt_text_ar: string | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          storage_path: string;
          file_name: string;
          mime_type: string;
          file_size: number;
          alt_text_sv?: string | null;
          alt_text_en?: string | null;
          alt_text_ar?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['media']['Insert']>;
        Relationships: [];
      };
      site_settings: {
        Row: {
          id: string;
          setting_key: string;
          setting_value: Json;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          setting_key: string;
          setting_value?: Json;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['site_settings']['Insert']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_user_role: { Args: Record<string, never>; Returns: string };
      is_admin: { Args: Record<string, never>; Returns: boolean };
      is_editor_or_admin: { Args: Record<string, never>; Returns: boolean };
      is_valid_slug: { Args: { value: string }; Returns: boolean };
      is_allowed_image_mime: { Args: { mime: string }; Returns: boolean };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

/** Example answer_data shape for multiple-choice quiz questions */
export interface QuizAnswerData {
  type: 'multiple_choice';
  choices: string[];
  correct: string;
}

/** Example exercise_data for embedded lesson exercises */
export interface ExerciseData {
  items?: Json[];
  config?: Record<string, Json>;
}
