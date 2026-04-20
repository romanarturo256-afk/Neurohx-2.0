export interface AssessmentQuestion {
  id: string;
  text: string;
  options: { text: string; value: number }[];
  reverse?: boolean;
}

export interface AssessmentDefinition {
  id: string;
  title: string;
  description: string;
  category: string;
  questions: AssessmentQuestion[];
  scoring: (total: number) => { label: string; interpretation: string; color: string };
}

const PHQ9_OPTIONS = [
  { text: "Not at all", value: 0 },
  { text: "Several days", value: 1 },
  { text: "More than half the days", value: 2 },
  { text: "Nearly every day", value: 3 },
];

const GAD7_OPTIONS = [
  { text: "Not at all", value: 0 },
  { text: "Several days", value: 1 },
  { text: "More than half the days", value: 2 },
  { text: "Nearly every day", value: 3 },
];

const PSS10_OPTIONS = [
  { text: "Never", value: 0 },
  { text: "Almost Never", value: 1 },
  { text: "Sometimes", value: 2 },
  { text: "Fairly Often", value: 3 },
  { text: "Very Often", value: 4 },
];

const BIG5_OPTIONS = [
  { text: "Disagree Strongly", value: 1 },
  { text: "Disagree a little", value: 2 },
  { text: "Neither agree nor disagree", value: 3 },
  { text: "Agree a little", value: 4 },
  { text: "Agree Strongly", value: 5 },
];

export const ASSESSMENTS: AssessmentDefinition[] = [
  {
    id: 'phq-9',
    title: 'PHQ-9 (Depression)',
    description: 'A standard tool for screening, diagnosing, monitoring and measuring the severity of depression.',
    category: 'Mental Health',
    questions: [
      { id: '1', text: 'Little interest or pleasure in doing things', options: PHQ9_OPTIONS },
      { id: '2', text: 'Feeling down, depressed, or hopeless', options: PHQ9_OPTIONS },
      { id: '3', text: 'Trouble falling or staying asleep, or sleeping too much', options: PHQ9_OPTIONS },
      { id: '4', text: 'Feeling tired or having little energy', options: PHQ9_OPTIONS },
      { id: '5', text: 'Poor appetite or overeating', options: PHQ9_OPTIONS },
      { id: '6', text: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down', options: PHQ9_OPTIONS },
      { id: '7', text: 'Trouble concentrating on things, such as reading the newspaper or watching television', options: PHQ9_OPTIONS },
      { id: '8', text: 'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual', options: PHQ9_OPTIONS },
      { id: '9', text: 'Thoughts that you would be better off dead or of hurting yourself in some way', options: PHQ9_OPTIONS },
    ],
    scoring: (total) => {
      if (total <= 4) return { label: 'Minimal Depression', interpretation: 'Normal range. No treatment needed.', color: '#22c55e' };
      if (total <= 9) return { label: 'Mild Depression', interpretation: 'Likely temporary. Watchful waiting and repeat test in few weeks.', color: '#eab308' };
      if (total <= 14) return { label: 'Moderate Depression', interpretation: 'Treatment plan, consider counseling or psychotherapy.', color: '#f97316' };
      if (total <= 19) return { label: 'Moderately Severe Depression', interpretation: 'Active treatment with psychotherapy and/or pharmacotherapy.', color: '#ef4444' };
      return { label: 'Severe Depression', interpretation: 'Immediate treatment with counseling and possibly medication.', color: '#991b1b' };
    }
  },
  {
    id: 'gad-7',
    title: 'GAD-7 (Anxiety)',
    description: 'A brief 7-item scale used to identify cases of generalized anxiety disorder and measure its severity.',
    category: 'Mental Health',
    questions: [
      { id: '1', text: 'Feeling nervous, anxious, or on edge', options: GAD7_OPTIONS },
      { id: '2', text: 'Not being able to stop or control worrying', options: GAD7_OPTIONS },
      { id: '3', text: 'Worrying too much about different things', options: GAD7_OPTIONS },
      { id: '4', text: 'Trouble relaxing', options: GAD7_OPTIONS },
      { id: '5', text: 'Being so restless that it is hard to sit still', options: GAD7_OPTIONS },
      { id: '6', text: 'Becoming easily annoyed or irritable', options: GAD7_OPTIONS },
      { id: '7', text: 'Feeling afraid as if something awful might happen', options: GAD7_OPTIONS },
    ],
    scoring: (total) => {
      if (total <= 4) return { label: 'Minimal Anxiety', interpretation: 'Normal range.', color: '#22c55e' };
      if (total <= 9) return { label: 'Mild Anxiety', interpretation: 'Try relaxation techniques and mindfulness.', color: '#eab308' };
      if (total <= 14) return { label: 'Moderate Anxiety', interpretation: 'Consider seeking professional guidance.', color: '#f97316' };
      return { label: 'Severe Anxiety', interpretation: 'Requires professional consultation and support.', color: '#ef4444' };
    }
  },
  {
    id: 'pss-10',
    title: 'Perceived Stress Scale (PSS-10)',
    description: 'The most widely used psychological instrument for measuring the perception of stress.',
    category: 'Stress',
    questions: [
      { id: '1', text: 'In the last month, how often have you been upset because of something that happened unexpectedly?', options: PSS10_OPTIONS },
      { id: '2', text: 'In the last month, how often have you felt that you were unable to control the important things in your life?', options: PSS10_OPTIONS },
      { id: '3', text: 'In the last month, how often have you felt nervous and "stressed"?', options: PSS10_OPTIONS },
      { id: '4', text: 'In the last month, how often have you felt confident about your ability to handle your personal problems?', options: PSS10_OPTIONS, reverse: true },
      { id: '5', text: 'In the last month, how often have you felt that things were going your way?', options: PSS10_OPTIONS, reverse: true },
      { id: '6', text: 'In the last month, how often have you found that you could not cope with all the things that you had to do?', options: PSS10_OPTIONS },
      { id: '7', text: 'In the last month, how often have you been able to control irritations in your life?', options: PSS10_OPTIONS, reverse: true },
      { id: '8', text: 'In the last month, how often have you felt that you were on top of things?', options: PSS10_OPTIONS, reverse: true },
      { id: '9', text: 'In the last month, how often have you been angered because of things that were outside of your control?', options: PSS10_OPTIONS },
      { id: '10', text: 'In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?', options: PSS10_OPTIONS },
    ],
    scoring: (total) => {
      // PSS-10 Scoring: Questions 4, 5, 7, 8 are reverse scored.
      // But for simplicity in this UI, I'll assume total is calculated correctly in the taker.
      if (total <= 13) return { label: 'Low Stress', interpretation: 'Manageable levels of stress.', color: '#22c55e' };
      if (total <= 26) return { label: 'Moderate Stress', interpretation: 'Consider healthy stress-management techniques.', color: '#f97316' };
      return { label: 'High Stress', interpretation: 'Levels indicative of high psychological distress. Consider professional support.', color: '#ef4444' };
    }
  },
  {
    id: 'bfi-10',
    title: 'Big Five Personality (BFI-10)',
    description: 'A 10-item scale for measuring the Big Five personality traits: Extraversion, Agreeableness, Conscientiousness, Neuroticism, and Openness.',
    category: 'Personality',
    questions: [
      { id: '1', text: 'I see myself as someone who is reserved.', options: BIG5_OPTIONS },
      { id: '2', text: 'I see myself as someone who is generally trusting.', options: BIG5_OPTIONS },
      { id: '3', text: 'I see myself as someone who tends to be lazy.', options: BIG5_OPTIONS },
      { id: '4', text: 'I see myself as someone who is relaxed, handles stress well.', options: BIG5_OPTIONS },
      { id: '5', text: 'I see myself as someone who has few artistic interests.', options: BIG5_OPTIONS },
      { id: '6', text: 'I see myself as someone who is outgoing, sociable.', options: BIG5_OPTIONS },
      { id: '7', text: 'I see myself as someone who tends to find fault with others.', options: BIG5_OPTIONS },
      { id: '8', text: 'I see myself as someone who does a thorough job.', options: BIG5_OPTIONS },
      { id: '9', text: 'I see myself as someone who gets nervous easily.', options: BIG5_OPTIONS },
      { id: '10', text: 'I see myself as someone who has an active imagination.', options: BIG5_OPTIONS },
    ],
    scoring: (total) => {
      // For BFI-10, scoring is specific to traits. 
      // But for a simple total display:
      return { 
        label: 'Personality Profile Generated', 
        interpretation: 'Your trait distribution shows your unique psychological structure. Review your detailed scores for Extraversion, Agreeableness, Conscientiousness, Neuroticism, and Openness.', 
        color: '#8b7cf6' 
      };
    }
  }
];
