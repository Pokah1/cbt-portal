export type ShuffledOption = {
  content: string
  originalLetter: string
}

export type Question = {
  id: string
  body: string
  order_index: number
  section_id: string
  section_title: string
  shuffledOptions: ShuffledOption[]
}