export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      academic_years: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          is_active: boolean
          name: string
          start_date: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          is_active?: boolean
          name: string
          start_date: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          is_active?: boolean
          name?: string
          start_date?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      attendance: {
        Row: {
          created_at: string
          date: string
          id: string
          profile_id: string | null
          status: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          profile_id?: string | null
          status: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          profile_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_event_teachers: {
        Row: {
          event_id: string
          teacher_id: string
        }
        Insert: {
          event_id: string
          teacher_id: string
        }
        Update: {
          event_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_event_teachers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          created_at: string
          date: string
          description: string | null
          end_time: string | null
          id: string
          name: string
          reminder_set: boolean | null
          reminder_time: string | null
          reminder_times: string[] | null
          start_time: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          date: string
          description?: string | null
          end_time?: string | null
          id?: string
          name: string
          reminder_set?: boolean | null
          reminder_time?: string | null
          reminder_times?: string[] | null
          start_time?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          description?: string | null
          end_time?: string | null
          id?: string
          name?: string
          reminder_set?: boolean | null
          reminder_time?: string | null
          reminder_times?: string[] | null
          start_time?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      classes: {
        Row: {
          created_at: string
          id: string
          name: string
          year_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          year_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          year_id?: string
        }
        Relationships: []
      }
      event_teachers: {
        Row: {
          event_id: string
          teacher_id: string
        }
        Insert: {
          event_id: string
          teacher_id: string
        }
        Update: {
          event_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_teachers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          created_by: string | null
          date: string
          description: string | null
          end_time: string | null
          id: string
          name: string
          start_time: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          date: string
          description?: string | null
          end_time?: string | null
          id?: string
          name: string
          start_time?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string | null
          end_time?: string | null
          id?: string
          name?: string
          start_time?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      exam_assignments: {
        Row: {
          academic_year_id: string
          created_at: string
          exam_id: string
          id: string
          section_id: string
        }
        Insert: {
          academic_year_id: string
          created_at?: string
          exam_id: string
          id?: string
          section_id: string
        }
        Update: {
          academic_year_id?: string
          created_at?: string
          exam_id?: string
          id?: string
          section_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_assignments_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_assignments_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_assignments_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_results: {
        Row: {
          created_at: string
          exam_id: string | null
          id: string
          score: number
          student_id: string | null
        }
        Insert: {
          created_at?: string
          exam_id?: string | null
          id?: string
          score: number
          student_id?: string | null
        }
        Update: {
          created_at?: string
          exam_id?: string | null
          id?: string
          score?: number
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_results_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          created_at: string
          date: string
          id: string
          max_score: number
          name: string
          section_id: string | null
          subject_id: string | null
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          max_score: number
          name: string
          section_id?: string | null
          subject_id?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          max_score?: number
          name?: string
          section_id?: string | null
          subject_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exams_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_events: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          event_date: string
          id: string
          title: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          event_date: string
          id?: string
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          event_date?: string
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_media: {
        Row: {
          created_at: string
          event_id: string
          file_name: string
          file_type: string
          file_url: string
          id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          file_name: string
          file_type: string
          file_url: string
          id?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          file_name?: string
          file_type?: string
          file_url?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_media_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "gallery_events"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_involved_persons: {
        Row: {
          id: string
          incident_id: string
          role: string
          user_id: string
        }
        Insert: {
          id?: string
          incident_id: string
          role: string
          user_id: string
        }
        Update: {
          id?: string
          incident_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_involved_persons_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          assigned_to: string | null
          created_at: string
          date: string
          description: string
          id: string
          investigation_notes: string | null
          location: string
          reported_by: string
          resolution_date: string | null
          resolution_details: string | null
          severity: string
          status: string
          sub_type: string | null
          time: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          date: string
          description: string
          id?: string
          investigation_notes?: string | null
          location: string
          reported_by: string
          resolution_date?: string | null
          resolution_details?: string | null
          severity: string
          status: string
          sub_type?: string | null
          time: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          date?: string
          description?: string
          id?: string
          investigation_notes?: string | null
          location?: string
          reported_by?: string
          resolution_date?: string | null
          resolution_details?: string | null
          severity?: string
          status?: string
          sub_type?: string | null
          time?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      note_classes: {
        Row: {
          class_id: string
          note_id: string
        }
        Insert: {
          class_id: string
          note_id: string
        }
        Update: {
          class_id?: string
          note_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "note_classes_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
        ]
      }
      note_sections: {
        Row: {
          note_id: string
          section_id: string
        }
        Insert: {
          note_id: string
          section_id: string
        }
        Update: {
          note_id?: string
          section_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_sections_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "note_sections_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          google_drive_link: string
          id: string
          share_with_all_grades: boolean | null
          share_with_all_sections_in_grades: boolean | null
          title: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          google_drive_link: string
          id?: string
          share_with_all_grades?: boolean | null
          share_with_all_sections_in_grades?: boolean | null
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          google_drive_link?: string
          id?: string
          share_with_all_grades?: boolean | null
          share_with_all_sections_in_grades?: boolean | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      online_classes: {
        Row: {
          class_id: string
          created_at: string
          created_by: string
          date: string
          end_time: string | null
          google_meet_link: string
          id: string
          section_id: string
          start_time: string
          subject_id: string
          title: string | null
        }
        Insert: {
          class_id: string
          created_at?: string
          created_by: string
          date: string
          end_time?: string | null
          google_meet_link: string
          id?: string
          section_id: string
          start_time: string
          subject_id: string
          title?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string
          created_by?: string
          date?: string
          end_time?: string | null
          google_meet_link?: string
          id?: string
          section_id?: string
          start_time?: string
          subject_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "online_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "online_classes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "online_classes_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "online_classes_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_name: string
          id: string
          last_name: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      sections: {
        Row: {
          class_id: string | null
          created_at: string
          id: string
          name: string
          teacher_id: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          id?: string
          name: string
          teacher_id?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string
          id?: string
          name?: string
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sections_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sections_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_attendance: {
        Row: {
          created_at: string | null
          created_by: string | null
          date: string
          id: string
          notes: string | null
          section_id: string
          status: string
          student_id: string
          subject_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          date: string
          id?: string
          notes?: string | null
          section_id: string
          status: string
          student_id: string
          subject_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          date?: string
          id?: string
          notes?: string | null
          section_id?: string
          status?: string
          student_id?: string
          subject_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_attendance_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_attendance_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_attendance_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      student_details: {
        Row: {
          admission_number: string | null
          created_at: string
          current_class_id: string | null
          current_section_id: string | null
          dateofbirth: string
          gender: string
          guardian: Json
          id: string
          language: string
          medical: Json
          nationality: string
        }
        Insert: {
          admission_number?: string | null
          created_at?: string
          current_class_id?: string | null
          current_section_id?: string | null
          dateofbirth: string
          gender: string
          guardian: Json
          id: string
          language: string
          medical: Json
          nationality: string
        }
        Update: {
          admission_number?: string | null
          created_at?: string
          current_class_id?: string | null
          current_section_id?: string | null
          dateofbirth?: string
          gender?: string
          guardian?: Json
          id?: string
          language?: string
          medical?: Json
          nationality?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_details_current_class_id_fkey"
            columns: ["current_class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_details_current_section_id_fkey"
            columns: ["current_section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_details_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_exam_results: {
        Row: {
          created_at: string
          exam_id: string
          feedback: string | null
          id: string
          marks_obtained: number
          student_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          exam_id: string
          feedback?: string | null
          id?: string
          marks_obtained: number
          student_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          exam_id?: string
          feedback?: string | null
          id?: string
          marks_obtained?: number
          student_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_exam_results_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_exam_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_exam_results_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_sections: {
        Row: {
          section_id: string
          student_id: string
        }
        Insert: {
          section_id: string
          student_id: string
        }
        Update: {
          section_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_sections_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_sections_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subject_classes: {
        Row: {
          class_id: string
          created_at: string | null
          id: string
          subject_id: string
        }
        Insert: {
          class_id: string
          created_at?: string | null
          id?: string
          subject_id: string
        }
        Update: {
          class_id?: string
          created_at?: string | null
          id?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subject_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subject_classes_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      subject_section_teachers: {
        Row: {
          academic_year_id: string | null
          class_id: string | null
          created_at: string | null
          id: string
          section_id: string
          subject_id: string
          teacher_id: string
        }
        Insert: {
          academic_year_id?: string | null
          class_id?: string | null
          created_at?: string | null
          id?: string
          section_id: string
          subject_id: string
          teacher_id: string
        }
        Update: {
          academic_year_id?: string | null
          class_id?: string | null
          created_at?: string | null
          id?: string
          section_id?: string
          subject_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subject_section_teachers_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subject_section_teachers_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subject_section_teachers_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subject_section_teachers_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subject_section_teachers_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to_class_id: string | null
          assigned_to_section_id: string | null
          assigned_to_user_id: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          due_time: string | null
          google_drive_link: string | null
          id: string
          status: Database["public"]["Enums"]["task_status"]
          subject_id: string | null
          title: string
          type: Database["public"]["Enums"]["task_type"]
          updated_at: string
        }
        Insert: {
          assigned_to_class_id?: string | null
          assigned_to_section_id?: string | null
          assigned_to_user_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          google_drive_link?: string | null
          id?: string
          status?: Database["public"]["Enums"]["task_status"]
          subject_id?: string | null
          title: string
          type: Database["public"]["Enums"]["task_type"]
          updated_at?: string
        }
        Update: {
          assigned_to_class_id?: string | null
          assigned_to_section_id?: string | null
          assigned_to_user_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          google_drive_link?: string | null
          id?: string
          status?: Database["public"]["Enums"]["task_status"]
          subject_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["task_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_class_id_fkey"
            columns: ["assigned_to_class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assigned_to_section_id_fkey"
            columns: ["assigned_to_section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assigned_to_user_id_fkey"
            columns: ["assigned_to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_attendance: {
        Row: {
          check_in: string | null
          check_out: string | null
          created_at: string | null
          date: string
          id: string
          status: string
          teacher_id: string
          updated_at: string | null
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string | null
          date: string
          id?: string
          status: string
          teacher_id: string
          updated_at?: string | null
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string | null
          date?: string
          id?: string
          status?: string
          teacher_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teacher_attendance_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_details: {
        Row: {
          contact_info: Json
          created_at: string | null
          date_of_birth: string
          emergency_contact: Json
          gender: string
          homeroom_section_id: string | null
          id: string
          medical_info: Json
          nationality: string
          professional_info: Json
        }
        Insert: {
          contact_info?: Json
          created_at?: string | null
          date_of_birth: string
          emergency_contact?: Json
          gender: string
          homeroom_section_id?: string | null
          id: string
          medical_info?: Json
          nationality: string
          professional_info?: Json
        }
        Update: {
          contact_info?: Json
          created_at?: string | null
          date_of_birth?: string
          emergency_contact?: Json
          gender?: string
          homeroom_section_id?: string | null
          id?: string
          medical_info?: Json
          nationality?: string
          professional_info?: Json
        }
        Relationships: [
          {
            foreignKeyName: "teacher_details_homeroom_section_id_fkey"
            columns: ["homeroom_section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_details_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_subjects: {
        Row: {
          subject_id: string
          teacher_id: string
        }
        Insert: {
          subject_id: string
          teacher_id: string
        }
        Update: {
          subject_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_subjects_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      timetable: {
        Row: {
          created_at: string
          day_of_week: number | null
          end_time: string
          id: string
          section_id: string | null
          start_time: string
          subject_id: string | null
          teacher_id: string | null
        }
        Insert: {
          created_at?: string
          day_of_week?: number | null
          end_time: string
          id?: string
          section_id?: string | null
          start_time: string
          subject_id?: string | null
          teacher_id?: string | null
        }
        Update: {
          created_at?: string
          day_of_week?: number | null
          end_time?: string
          id?: string
          section_id?: string | null
          start_time?: string
          subject_id?: string | null
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "timetable_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      insert_student_details: {
        Args: {
          profile_id: string
          nationality: string
          language_pref: string
          date_of_birth: string
          gender_type: string
          guardian_info: Json
          medical_info: Json
        }
        Returns: undefined
      }
      insert_teacher_details: {
        Args: {
          profile_id: string
          gender_type: string
          birth_date: string
          nationality_val: string
          contact_data: Json
          professional_data: Json
          emergency_data: Json
          medical_data: Json
        }
        Returns: undefined
      }
    }
    Enums: {
      task_status: "pending" | "in_progress" | "completed" | "cancelled"
      task_type: "personal" | "assignment" | "admin_task"
      user_role: "admin" | "teacher" | "student" | "parent"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      task_status: ["pending", "in_progress", "completed", "cancelled"],
      task_type: ["personal", "assignment", "admin_task"],
      user_role: ["admin", "teacher", "student", "parent"],
    },
  },
} as const
