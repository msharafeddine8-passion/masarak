// src/lib/testimonials.ts — Sprint 3.2
// Read-only client for published testimonials.

import { supabase } from '@/lib/supabase';

export type Testimonial = {
  id: number;
  name: string;
  image_url: string | null;
  school_name: string | null;
  university_name: string | null;
  body: string;
  display_order: number;
};

export async function listPublishedTestimonials(limit = 12): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('id, name, image_url, school_name, university_name, body, display_order')
    .eq('is_published', true)
    .order('display_order', { ascending: true })
    .limit(limit);
  if (error) return [];
  return (data || []) as Testimonial[];
}
