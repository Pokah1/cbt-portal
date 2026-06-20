'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

export type QuestionInput = {
  section_id: string
  body: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: 'A' | 'B' | 'C' | 'D'
  marks: number
}

export async function getSectionsOverview() {
  const supabase = createAdminClient()

  const { data: sections, error } = await supabase
    .from('sections')
    .select(`
      id,
      title,
      question_count,
      order_index,
      exams ( title, categories ( name ) ),
      questions ( id )
    `)
    .order('order_index')

  if (error) {
    return { success: false, sections: [] }
  }

  return { success: true, sections: sections ?? [] }
}

export async function getQuestionsBySection(sectionId: string) {
  const supabase = createAdminClient()

  const { data: section } = await supabase
    .from('sections')
    .select('id, title, question_count, exams ( title, categories ( name ) )')
    .eq('id', sectionId)
    .single()

  const { data: questions, error } = await supabase
    .from('questions')
    .select('*')
    .eq('section_id', sectionId)
    .order('order_index')

  if (error) {
    return { success: false, section: null, questions: [] }
  }

  return { success: true, section, questions: questions ?? [] }
}

export async function createQuestion(input: QuestionInput) {
  const supabase = createAdminClient()

  const { data: existing } = await supabase
    .from('questions')
    .select('order_index')
    .eq('section_id', input.section_id)
    .order('order_index', { ascending: false })
    .limit(1)

  const nextOrderIndex = (existing?.[0]?.order_index ?? 0) + 1

  const { data, error } = await supabase
    .from('questions')
    .insert({
      ...input,
      order_index: nextOrderIndex,
    })
    .select()
    .single()

  if (error) {
    return { success: false as const, error: error.message, question: null }
  }

  revalidatePath(`/admin/questions/${input.section_id}`)
  revalidatePath('/admin/questions')
  return { success: true as const, error: null, question: data }
}

export async function updateQuestion(
  questionId: string,
  input: QuestionInput
) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('questions')
    .update({
      body: input.body,
      option_a: input.option_a,
      option_b: input.option_b,
      option_c: input.option_c,
      option_d: input.option_d,
      correct_option: input.correct_option,
      marks: input.marks,
    })
    .eq('id', questionId)

  if (error) {
    return { success: false, error: 'Failed to update question' }
  }

  revalidatePath(`/admin/questions/${input.section_id}`)
  return { success: true }
}

export async function deleteQuestion(questionId: string, sectionId: string) {
  const supabase = createAdminClient()

  // Delete any answers referencing this question first
  await supabase.from('answers').delete().eq('question_id', questionId)

  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', questionId)

  if (error) {
    return { success: false, error: 'Failed to delete question' }
  }

  revalidatePath(`/admin/questions/${sectionId}`)
  revalidatePath('/admin/questions')
  return { success: true }
}