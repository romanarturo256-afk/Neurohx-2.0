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
  scoring: (total: number) => { 
    label: string; 
    interpretation: string; 
    color: string;
    suggestions: string[];
  };
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

const ASRS_OPTIONS = [
  { text: "Never", value: 0 },
  { text: "Rarely", value: 1 },
  { text: "Sometimes", value: 2 },
  { text: "Often", value: 3 },
  { text: "Very Often", value: 4 },
];

const YES_NO_OPTIONS = [
  { text: "No", value: 0 },
  { text: "Yes", value: 1 },
];

const PCL5_OPTIONS = [
  { text: "Not at all", value: 0 },
  { text: "A little bit", value: 1 },
  { text: "Moderately", value: 2 },
  { text: "Quite a bit", value: 3 },
  { text: "Extremely", value: 4 },
];

const PSQI_OPTIONS = [
  { text: "Not during the past month", value: 0 },
  { text: "Less than once a week", value: 1 },
  { text: "Once or twice a week", value: 2 },
  { text: "Three or more times a week", value: 3 },
];

const RSES_OPTIONS = [
  { text: "Strongly Disagree", value: 0 },
  { text: "Disagree", value: 1 },
  { text: "Agree", value: 2 },
  { text: "Strongly Agree", value: 3 },
];

const ESS_OPTIONS = [
  { text: "Would never doze", value: 0 },
  { text: "Slight chance of dozing", value: 1 },
  { text: "Moderate chance of dozing", value: 2 },
  { text: "High chance of dozing", value: 3 },
];

const CBI_OPTIONS = [
  { text: "Always", value: 100 },
  { text: "Often", value: 75 },
  { text: "Sometimes", value: 50 },
  { text: "Seldom", value: 25 },
  { text: "Never/Hardly ever", value: 0 },
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
      if (total <= 4) return { 
        label: 'Minimal Depression', 
        interpretation: 'Normal range. No treatment needed.', 
        color: '#22c55e',
        suggestions: ['Maintain current routine', 'Practice daily gratitude', 'Stay socially active']
      };
      if (total <= 9) return { 
        label: 'Mild Depression', 
        interpretation: 'Likely temporary. Watchful waiting and repeat test in few weeks.', 
        color: '#eab308',
        suggestions: ['Increase physical activity', 'Establish a strict sleep schedule', 'Limit social media use']
      };
      if (total <= 14) return { 
        label: 'Moderate Depression', 
        interpretation: 'Treatment plan, consider counseling or psychotherapy.', 
        color: '#f97316',
        suggestions: ['Schedule a counseling intake', 'Join a support group', 'Practice mindfulness meditation']
      };
      if (total <= 19) return { 
        label: 'Moderately Severe Depression', 
        interpretation: 'Active treatment with psychotherapy and/or pharmacotherapy.', 
        color: '#ef4444',
        suggestions: ['Consult a psychiatrist', 'Engage in CBT exercises', 'Monitor symptoms daily']
      };
      return { 
        label: 'Severe Depression', 
        interpretation: 'Immediate treatment with counseling and possibly medication.', 
        color: '#991b1b',
        suggestions: ['Seek urgent clinical consultation', 'Engage crisis support if needed', 'Intensive daily therapy']
      };
    }
  },
  {
    id: 'ess',
    title: 'Epworth Sleepiness Scale (ESS)',
    description: 'Measure your general level of daytime sleepiness.',
    category: 'Lifestyle',
    questions: [
      { id: '1', text: 'Sitting and reading', options: ESS_OPTIONS },
      { id: '2', text: 'Watching TV', options: ESS_OPTIONS },
      { id: '3', text: 'Sitting inactive in a public place', options: ESS_OPTIONS },
      { id: '4', text: 'As a passenger in a car for an hour without a break', options: ESS_OPTIONS },
      { id: '5', text: 'Lying down to rest in the afternoon when circumstances permit', options: ESS_OPTIONS },
      { id: '6', text: 'Sitting and talking to someone', options: ESS_OPTIONS },
      { id: '7', text: 'Sitting quietly after a lunch without alcohol', options: ESS_OPTIONS },
      { id: '8', text: 'In a car, while stopped for a few minutes in traffic', options: ESS_OPTIONS },
    ],
    scoring: (total) => {
      if (total >= 10) return { label: 'Excessive Sleepiness', interpretation: 'Likely struggling with significant daytime sleepiness.', color: '#ef4444', suggestions: ['Consult sleep specialist', 'Evaluate for sleep apnea', 'Maintain consistent sleep hygiene'] };
      return { label: 'Normal Sleepiness', interpretation: 'Normal range of sleepiness.', color: '#22c55e', suggestions: ['Continue current sleep schedule'] };
    }
  },
  {
    id: 'cbi',
    title: 'Copenhagen Burnout Inventory (CBI)',
    description: 'Assess personal, work-related, and client-related burnout levels.',
    category: 'Work',
    questions: [
      { id: '1', text: 'How often do you feel tired?', options: CBI_OPTIONS },
      { id: '2', text: 'How often are you physically exhausted?', options: CBI_OPTIONS },
      { id: '3', text: 'How often are you emotionally exhausted?', options: CBI_OPTIONS },
      { id: '4', text: 'How often do you think: "I can’t take it anymore"?', options: CBI_OPTIONS },
      { id: '5', text: 'How often do you feel worn out?', options: CBI_OPTIONS },
      { id: '6', text: 'How often do you feel weak and susceptible to illness?', options: CBI_OPTIONS },
    ],
    scoring: (total) => {
      const avg = total / 6;
      if (avg >= 75) return { label: 'Severe Burnout', interpretation: 'Critical levels of exhaustion and burnout.', color: '#ef4444', suggestions: ['Immediate workload reduction', 'Seek professional mental health support', 'Extended recovery break'] };
      if (avg >= 50) return { label: 'Moderate Burnout', interpretation: 'Significant signs of burnout detected.', color: '#f97316', suggestions: ['Strict boundary setting', 'Prioritize self-care', 'Talk to your manager'] };
      return { label: 'Low/No Burnout', interpretation: 'Healthy levels of work-life balance.', color: '#22c55e', suggestions: ['Maintain current boundaries'] };
    }
  },
  {
    id: 'scs-sf',
    title: 'Self-Compassion Scale (SCS-SF)',
    description: 'Assess how kindly you treat yourself during difficult times.',
    category: 'Psychology',
    questions: [
      { id: '1', text: 'When I’m going through a very hard time, I give myself the caring and tenderness I need.', options: BIG5_OPTIONS },
      { id: '2', text: 'I’m intolerant and impatient towards those aspects of my personality I don’t like.', options: BIG5_OPTIONS, reverse: true },
      { id: '3', text: 'When I’m feeling down, I tend to feel like most other people are probably happier than I am.', options: BIG5_OPTIONS, reverse: true },
      { id: '4', text: 'When I fail at something important to me I tend to consume myself with feelings of inadequacy.', options: BIG5_OPTIONS, reverse: true },
      { id: '5', text: 'I try to be understanding and patient towards those aspects of my personality I don’t like.', options: BIG5_OPTIONS },
    ],
    scoring: (total) => {
      const avg = total / 5;
      if (avg >= 3.5) return { label: 'High Self-Compassion', interpretation: 'You are very kind to yourself.', color: '#22c55e', suggestions: ['Continue mindful self-kindness'] };
      if (avg >= 2.5) return { label: 'Moderate Self-Compassion', interpretation: 'Average level of self-compassion.', color: '#8b7cf6', suggestions: ['Practice self-compassion mantras'] };
      return { label: 'Low Self-Compassion', interpretation: 'You tend to be hard on yourself.', color: '#ef4444', suggestions: ['Loving-kindness meditation', 'Challenge self-criticism'] };
    }
  },
  {
    id: 'asrm',
    title: 'ASRM (Mania)',
    description: 'Altman Self-Rating Mania Scale to assess current manic symptoms.',
    category: 'Mental Health',
    questions: [
      { id: '1', text: 'I feel happier or more cheerful than usual.', options: [
        { text: "Not at all", value: 0 },
        { text: "A little", value: 1 },
        { text: "Somewhat", value: 2 },
        { text: "Quite a bit", value: 3 },
        { text: "Very much", value: 4 },
      ] },
      { id: '2', text: 'I feel more self-confident than usual.', options: [
        { text: "Not at all", value: 0 },
        { text: "A little", value: 1 },
        { text: "Somewhat", value: 2 },
        { text: "Quite a bit", value: 3 },
        { text: "Very much", value: 4 },
      ] },
      { id: '3', text: 'I need less sleep than usual.', options: [
        { text: "Not at all", value: 0 },
        { text: "A little", value: 1 },
        { text: "Somewhat", value: 2 },
        { text: "Quite a bit", value: 3 },
        { text: "Very much", value: 4 },
      ] },
      { id: '4', text: 'I talk more than usual.', options: [
        { text: "Not at all", value: 0 },
        { text: "A little", value: 1 },
        { text: "Somewhat", value: 2 },
        { text: "Quite a bit", value: 3 },
        { text: "Very much", value: 4 },
      ] },
      { id: '5', text: 'I am more active than usual.', options: [
        { text: "Not at all", value: 0 },
        { text: "A little", value: 1 },
        { text: "Somewhat", value: 2 },
        { text: "Quite a bit", value: 3 },
        { text: "Very much", value: 4 },
      ] },
    ],
    scoring: (total) => {
      if (total >= 6) return {
        label: 'Clinical Significance',
        interpretation: 'Manic symptoms detected. Consult a professional.',
        color: '#f97316',
        suggestions: ['Seek professional screening', 'Mood stabilization tracking', 'Avoid major life decisions']
      };
      return {
        label: 'Minimal Manic Symptoms',
        interpretation: 'Symptoms within normal range.',
        color: '#22c55e',
        suggestions: ['Maintain healthy sleep patterns', 'Regular emotional check-ins']
      };
    }
  },
  {
    id: 'rses',
    title: 'RSES (Self-Esteem)',
    description: 'Rosenberg Self-Esteem Scale for measuring global self-worth.',
    category: 'Personality',
    questions: [
      { id: '1', text: 'On the whole, I am satisfied with myself.', options: RSES_OPTIONS },
      { id: '2', text: 'At times I think I am no good at all.', options: RSES_OPTIONS, reverse: true },
      { id: '3', text: 'I feel that I have a number of good qualities.', options: RSES_OPTIONS },
      { id: '4', text: 'I am able to do things as well as most other people.', options: RSES_OPTIONS },
      { id: '5', text: 'I feel I do not have much to be proud of.', options: RSES_OPTIONS, reverse: true },
      { id: '6', text: 'I feel useless at times.', options: RSES_OPTIONS, reverse: true },
      { id: '7', text: 'I feel that I am a person of worth, at least on an equal plane with others.', options: RSES_OPTIONS },
      { id: '8', text: 'I wish I could have more respect for myself.', options: RSES_OPTIONS, reverse: true },
      { id: '9', text: 'All in all, I am inclined to feel that I am a failure.', options: RSES_OPTIONS, reverse: true },
      { id: '10', text: 'I take a positive attitude toward myself.', options: RSES_OPTIONS },
    ],
    scoring: (total) => {
      if (total < 15) return {
        label: 'Low Self-Esteem',
        interpretation: 'Below average self-worth. Consider counseling.',
        color: '#ef4444',
        suggestions: ['Affirmation practice', 'CBT for negative self-talk', 'Identify core strengths']
      };
      if (total < 25) return {
        label: 'Moderate Self-Esteem',
        interpretation: 'Healthy level of self-worth.',
        color: '#22c55e',
        suggestions: ['Self-compassion exercises', 'Set achievable goals']
      };
      return {
        label: 'High Self-Esteem',
        interpretation: 'Strong sense of self-worth.',
        color: '#8b7cf6',
        suggestions: ['Continue self-growth', 'Help others build confidence']
      };
    }
  },
  {
    id: 'psqi',
    title: 'PSQI (Sleep Quality)',
    description: 'Pittsburgh Sleep Quality Index to assess sleep patterns.',
    category: 'Lifestyle',
    questions: [
      { id: '1', text: 'During the past month, how would you rate your sleep quality overall?', options: PSQI_OPTIONS },
      { id: '2', text: 'Cannot get to sleep within 30 minutes', options: PSQI_OPTIONS },
      { id: '3', text: 'Wake up in the middle of the night or early morning', options: PSQI_OPTIONS },
      { id: '4', text: 'Have to use the bathroom', options: PSQI_OPTIONS },
      { id: '5', text: 'Cannot breathe comfortably', options: PSQI_OPTIONS },
    ],
    scoring: (total) => {
      if (total >= 5) return {
        label: 'Poor Sleep Quality',
        interpretation: 'Sleep indicates significant disturbance.',
        color: '#f97316',
        suggestions: ['Consult a sleep specialist', 'Review sleep hygiene', 'Limit evening screen time']
      };
      return {
        label: 'Good Sleep Quality',
        interpretation: 'Healthy sleep patterns.',
        color: '#22c55e',
        suggestions: ['Maintain consistency', 'Regular exercise']
      };
    }
  },
  {
    id: 'asrs-v1-1',
    title: 'ASRS v1.1 (ADHD)',
    description: 'Adult ADHD Self-Report Scale screening tool developed by WHO.',
    category: 'Mental Health',
    questions: [
      { id: '1', text: 'How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?', options: ASRS_OPTIONS },
      { id: '2', text: 'How often do you have difficulty getting things in order when you have to do a task that requires organization?', options: ASRS_OPTIONS },
      { id: '3', text: 'How often do you have problems remembering appointments or obligations?', options: ASRS_OPTIONS },
      { id: '4', text: 'When you have a task that requires a lot of thought, how often do you avoid or delay getting started?', options: ASRS_OPTIONS },
      { id: '5', text: 'How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?', options: ASRS_OPTIONS },
      { id: '6', text: 'How often do you feel overly active and compelled to do things, as if you were driven by a motor?', options: ASRS_OPTIONS },
    ],
    scoring: (total) => {
      if (total >= 4) return {
        label: 'Highly Likely ADHD',
        interpretation: 'Screening positive. Symptoms inconsistent with normal range.',
        color: '#ef4444',
        suggestions: ['Consult ADHD specialist', 'Look into executive function coaching', 'Limit distractions during work']
      };
      return {
        label: 'Low Probability ADHD',
        interpretation: 'Symptoms within normal expectations.',
        color: '#22c55e',
        suggestions: ['Maintain time-blocking', 'Use digital planners', 'Regular exercise for focus']
      };
    }
  },
  {
    id: 'mdq',
    title: 'MDQ (Bipolar Spectrum)',
    description: 'The Mood Disorder Questionnaire for screening bipolar spectrum disorders.',
    category: 'Mental Health',
    questions: [
      { id: '1', text: 'Has there ever been a period of time when you were not your usual self and you felt so good or so hyper that other people thought you were not your usual self or you were so hyper that you got into trouble?', options: YES_NO_OPTIONS },
      { id: '2', text: 'You were so irritable that you shouted at people or started fights or arguments?', options: YES_NO_OPTIONS },
      { id: '3', text: 'You felt much more self-confident than usual?', options: YES_NO_OPTIONS },
      { id: '4', text: 'You got much less sleep than usual and found you didn’t really miss it?', options: YES_NO_OPTIONS },
      { id: '5', text: 'You were much more talkative or spoke much faster than usual?', options: YES_NO_OPTIONS },
      { id: '6', text: 'Thoughts raced through your head or you couldn’t slow your mind down?', options: YES_NO_OPTIONS },
      { id: '7', text: 'You were so easily distracted by things around you that you had trouble concentrating or staying on track?', options: YES_NO_OPTIONS },
      { id: '8', text: 'You had much more energy than usual?', options: YES_NO_OPTIONS },
      { id: '9', text: 'You were much more active or did many more things than usual?', options: YES_NO_OPTIONS },
      { id: '10', text: 'You were much more social or outgoing than usual, for example, you telephoned friends in the middle of the night?', options: YES_NO_OPTIONS },
      { id: '11', text: 'You were much more interested in sex than usual?', options: YES_NO_OPTIONS },
      { id: '12', text: 'You did things that were unusual for you or that other people might have thought were excessive, foolish, or risky?', options: YES_NO_OPTIONS },
      { id: '13', text: 'Spending money got you or your family into trouble?', options: YES_NO_OPTIONS },
    ],
    scoring: (total) => {
      if (total >= 7) return {
        label: 'Possible Bipolar Spectrum',
        interpretation: 'Threshold for clinical significance met. Requires deeper assessment.',
        color: '#f97316',
        suggestions: ['Clinical psychiatric evaluation', 'Mood tracking for 2 weeks', 'Limit stimulant intake']
      };
      return {
        label: 'Low Bipolar Risk',
        interpretation: 'Symptoms unlikely to indicate bipolar spectrum.',
        color: '#22c55e',
        suggestions: ['Regular sleep hygiene', 'General mood maintenance']
      };
    }
  },
  {
    id: 'pcl-5',
    title: 'PCL-5 (PTSD)',
    description: 'The PTSD Checklist for DSM-5, used to monitor symptoms after trauma.',
    category: 'Mental Health',
    questions: [
      { id: '1', text: 'Repeated, disturbing, and unwanted memories of the stressful experience?', options: PCL5_OPTIONS },
      { id: '2', text: 'Repeated, disturbing dreams of the stressful experience?', options: PCL5_OPTIONS },
      { id: '3', text: 'Suddenly feeling or acting as if the stressful experience were actually happening again?', options: PCL5_OPTIONS },
      { id: '4', text: 'Feeling very upset when something reminded you of the stressful experience?', options: PCL5_OPTIONS },
      { id: '5', text: 'Having strong physical reactions when something reminded you of the stressful experience?', options: PCL5_OPTIONS },
    ],
    scoring: (total) => {
      if (total >= 10) return {
        label: 'Significant Trauma Symptoms',
        interpretation: 'Symptoms indicate potential PTSD. Professional support highly recommended.',
        color: '#ef4444',
        suggestions: ['Trauma-informed therapy', 'Grounding techniques', 'EMDR consultation']
      };
      return {
        label: 'Low Post-Traumatic Stress',
        interpretation: 'Normal range or low severity.',
        color: '#22c55e',
        suggestions: ['Self-care routine', 'Mindfulness meditation']
      };
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
      if (total <= 4) return { 
        label: 'Minimal Anxiety', 
        interpretation: 'Normal range.', 
        color: '#22c55e',
        suggestions: ['Regular physical exercise', 'Mindful breathing', 'Balanced nutrition']
      };
      if (total <= 9) return { 
        label: 'Mild Anxiety', 
        interpretation: 'Try relaxation techniques and mindfulness.', 
        color: '#eab308',
        suggestions: ['Limit caffeine intake', 'Progressive muscle relaxation', 'Journaling worries']
      };
      if (total <= 14) return { 
        label: 'Moderate Anxiety', 
        interpretation: 'Consider seeking professional guidance.', 
        color: '#f97316',
        suggestions: ['Cognitive restructuring', 'Structured breathing exercises', 'Reduce screen time']
      };
      return { 
        label: 'Severe Anxiety', 
        interpretation: 'Requires professional consultation and support.', 
        color: '#ef4444',
        suggestions: ['Immediate medical consultation', 'Begin therapeutic intervention', 'Anxiety management plan']
      };
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
      if (total <= 13) return { 
        label: 'Low Stress', 
        interpretation: 'Manageable levels of stress.', 
        color: '#22c55e',
        suggestions: ['Active relaxation', 'Adequate sleep (7-9h)', 'Time management']
      };
      if (total <= 26) return { 
        label: 'Moderate Stress', 
        interpretation: 'Consider healthy stress-management techniques.', 
        color: '#f97316',
        suggestions: ['Yoga or light stretching', 'Take regular work breaks', 'Deep breathing (4-7-8)']
      };
      return { 
        label: 'High Stress', 
        interpretation: 'Levels indicative of high psychological distress. Consider professional support.', 
        color: '#ef4444',
        suggestions: ['Professional stress management', 'Boundary setting', 'Stress-reduction therapy']
      };
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
      return { 
        label: 'Personality Profile Generated', 
        interpretation: 'Your trait distribution shows your unique psychological structure. Review your detailed scores for Extraversion, Agreeableness, Conscientiousness, Neuroticism, and Openness.', 
        color: '#8b7cf6',
        suggestions: ['Explore personality-fit career paths', 'Understand social dynamics', 'Leverage core strengths']
      };
    }
  },
  {
    id: 'introvert-extrovert',
    title: 'Introvert–Extrovert Test',
    description: 'Determine where you fall on the introversion-extroversion spectrum.',
    category: 'Personality',
    questions: [
      { id: '1', text: 'I prefer one-on-one conversations over group activities.', options: BIG5_OPTIONS },
      { id: '2', text: 'I often feel drained after attending large social events.', options: BIG5_OPTIONS },
      { id: '3', text: 'I enjoy being the center of attention.', options: BIG5_OPTIONS, reverse: true },
      { id: '4', text: 'I tend to think before I speak.', options: BIG5_OPTIONS },
      { id: '5', text: 'I feel comfortable meeting new people.', options: BIG5_OPTIONS, reverse: true },
    ],
    scoring: (total) => {
      if (total >= 18) return { label: 'Strong Introvert', interpretation: 'You prefer internal reflection and quiet environments.', color: '#8b7cf6', suggestions: ['Schedule solo recharge time', 'Deep work focus'] };
      if (total >= 12) return { label: 'Ambivert', interpretation: 'You balance internal and external energy well.', color: '#22c55e', suggestions: ['Choose social settings based on current energy'] };
      return { label: 'Strong Extrovert', interpretation: 'You gain energy from social interaction and external stimulation.', color: '#f97316', suggestions: ['Engage in team activities', 'Network regularly'] };
    }
  },
  {
    id: 'mini-spin',
    title: 'Social Anxiety (Mini-SPIN)',
    description: 'A 3-item screening tool for social anxiety disorder.',
    category: 'Mental Health',
    questions: [
      { id: '1', text: 'Fear of embarrassment causes me to avoid doing things or speaking to people.', options: PCL5_OPTIONS },
      { id: '2', text: 'I avoid activities in which I am the center of attention.', options: PCL5_OPTIONS },
      { id: '3', text: 'Being embarrassed or looking stupid are among my worst fears.', options: PCL5_OPTIONS },
    ],
    scoring: (total) => {
      if (total >= 6) return { label: 'Likely Social Anxiety', interpretation: 'Symptoms suggest significant social anxiety.', color: '#ef4444', suggestions: ['CBT for social anxiety', 'Gradual exposure exercises'] };
      return { label: 'Normal Social Comfort', interpretation: 'Minimal levels of social anxiety detected.', color: '#22c55e', suggestions: ['Continue social engagement'] };
    }
  },
  {
    id: 'dark-triad',
    title: 'Dark Triad Traits',
    description: 'Assessment of Narcissism, Machiavellianism, and Psychopathy levels.',
    category: 'Personality',
    questions: [
      { id: '1', text: 'I tend to manipulate others to get my way.', options: BIG5_OPTIONS },
      { id: '2', text: 'I insist on getting the respect I deserve.', options: BIG5_OPTIONS },
      { id: '3', text: 'I tend to lack remorse for my actions.', options: BIG5_OPTIONS },
      { id: '4', text: 'I tend to want others to admire me.', options: BIG5_OPTIONS },
      { id: '5', text: 'I tend to be cynical about others’ motives.', options: BIG5_OPTIONS },
    ],
    scoring: (total) => {
      if (total >= 20) return { label: 'Elevated Traits', interpretation: 'High presence of antagonistic personality traits.', color: '#111110', suggestions: ['Empathy training', 'Ethical reflection'] };
      return { label: 'Low Antagonism', interpretation: 'Traits within typical prosocial range.', color: '#22c55e', suggestions: ['Maintain prosocial behavior'] };
    }
  },
  {
    id: 'rs-14',
    title: 'Resilience Scale (RS-14)',
    description: 'A measure of individual resilience and the ability to bounce back.',
    category: 'Psychology',
    questions: [
      { id: '1', text: 'I usually manage one way or another.', options: BIG5_OPTIONS },
      { id: '2', text: 'I feel proud that I have accomplished things in life.', options: BIG5_OPTIONS },
      { id: '3', text: 'I usually take things in stride.', options: BIG5_OPTIONS },
      { id: '4', text: 'I am friends with myself.', options: BIG5_OPTIONS },
      { id: '5', text: 'I can get through difficult times because I’ve experienced difficulty before.', options: BIG5_OPTIONS },
    ],
    scoring: (total) => {
      if (total >= 20) return { label: 'High Resilience', interpretation: 'Strong capacity to adapt to stress.', color: '#22c55e', suggestions: ['Support others in crisis', 'Maintain positive mindset'] };
      if (total >= 13) return { label: 'Moderate Resilience', interpretation: 'Good coping skills with room for growth.', color: '#8b7cf6', suggestions: ['Build social support networks', 'Practice stress management'] };
      return { label: 'Low Resilience', interpretation: 'May struggle with major life changes.', color: '#ef4444', suggestions: ['Develop coping strategies', 'Seek resilience coaching'] };
    }
  },
  {
    id: 'anger-management',
    title: 'Anger Management Test',
    description: 'Evaluate your anger triggers and the effectiveness of your coping mechanisms.',
    category: 'Psychology',
    questions: [
      { id: '1', text: 'I frequently find myself getting angry at small things.', options: BIG5_OPTIONS },
      { id: '2', text: 'When I am angry, I lose control of my words or actions.', options: BIG5_OPTIONS },
      { id: '3', text: 'I tend to harbor grudges for a long time.', options: BIG5_OPTIONS },
      { id: '4', text: 'I am able to calm myself down quickly when upset.', options: BIG5_OPTIONS, reverse: true },
      { id: '5', text: 'People tell me I have a short fuse.', options: BIG5_OPTIONS },
    ],
    scoring: (total) => {
      if (total >= 18) return { label: 'High Anger Reactivity', interpretation: 'You may struggle with anger regulation.', color: '#ef4444', suggestions: ['Anger management counseling', 'De-escalation techniques', 'Identify triggers'] };
      return { label: 'Healthy Anger Regulation', interpretation: 'You manage your frustration effectively.', color: '#22c55e', suggestions: ['Continue mindful responses'] };
    }
  },
  {
    id: 'motivation-discipline',
    title: 'Motivation & Discipline Test',
    description: 'Measure your levels of intrinsic motivation vs. self-discipline.',
    category: 'Lifestyle',
    questions: [
      { id: '1', text: 'I find it easy to start tasks even when I don’t feel like it.', options: BIG5_OPTIONS },
      { id: '2', text: 'I rely on bursts of inspiration to get things done.', options: BIG5_OPTIONS, reverse: true },
      { id: '3', text: 'I am good at following a strict schedule.', options: BIG5_OPTIONS },
      { id: '4', text: 'I often procrastinate on difficult projects.', options: BIG5_OPTIONS, reverse: true },
      { id: '5', text: 'I finish what I start, regardless of how I feel.', options: BIG5_OPTIONS },
    ],
    scoring: (total) => {
      if (total >= 18) return { label: 'Disciplined & Motivated', interpretation: 'High levels of self-regulation and drive.', color: '#22c55e', suggestions: ['Mentor others', 'Set even more ambitious goals'] };
      if (total >= 12) return { label: 'Moderate Discipline', interpretation: 'Inconsistent focus, but functional.', color: '#8b7cf6', suggestions: ['Use time-blocking', 'Set smaller milestones'] };
      return { label: 'Low Discipline', interpretation: 'Struggle with consistency and follow-through.', color: '#f97316', suggestions: ['Habit stacking', 'Accountability partner', 'Remove environmental distractors'] };
    }
  },
  {
    id: 'shadow-self',
    title: 'Shadow Self Test',
    description: 'Discover the repressed aspects of your personality based on Jungian psychology.',
    category: 'Psychology',
    questions: [
      { id: '1', text: 'I often judge others for traits I secretly worry I possess.', options: BIG5_OPTIONS },
      { id: '2', text: 'I have "unacceptable" feelings that I try to hide from myself.', options: BIG5_OPTIONS },
      { id: '3', text: 'I find myself acting out in ways I later regret.', options: BIG5_OPTIONS },
      { id: '4', text: 'I am very aware of my own flaws and accept them.', options: BIG5_OPTIONS, reverse: true },
      { id: '5', text: 'I feel a sense of "darkness" or hidden potential within me.', options: BIG5_OPTIONS },
    ],
    scoring: (total) => {
      return { label: 'Shadow Profile Generated', interpretation: 'Your results suggest areas where your conscious and subconscious might be in conflict.', color: '#111110', suggestions: ['Shadow work journaling', 'Therapeutic exploration', 'Integration exercises'] };
    }
  },
  {
    id: 'caars-s',
    title: 'CAARS-S (ADHD)',
    description: "Conners' Adult ADHD Rating Scale for comprehensive symptom evaluation.",
    category: 'Mental Health',
    questions: [
      { id: '1', text: 'I am easily distracted.', options: PHQ9_OPTIONS },
      { id: '2', text: 'I have trouble keeping my mind on a task.', options: PHQ9_OPTIONS },
      { id: '3', text: 'I am always on the go, as if driven by a motor.', options: PHQ9_OPTIONS },
      { id: '4', text: 'I talk too much.', options: PHQ9_OPTIONS },
      { id: '5', text: 'I have trouble waiting my turn.', options: PHQ9_OPTIONS },
    ],
    scoring: (total) => {
      if (total >= 10) return { label: 'High ADHD Index', interpretation: 'Clinically significant ADHD symptoms detected.', color: '#ef4444', suggestions: ['Comprehensive clinical evaluation', 'Executive function support'] };
      return { label: 'Typical Range', interpretation: 'Symptom levels within normal variance.', color: '#22c55e', suggestions: ['Standard organizational habits'] };
    }
  },
  {
    id: 'ders-sf',
    title: 'Emotion Regulation (DERS-SF)',
    description: 'Assess difficulties in regulating emotional responses.',
    category: 'Psychology',
    questions: [
      { id: '1', text: 'When I am upset, I have difficulty concentrating.', options: BIG5_OPTIONS },
      { id: '2', text: 'When I am upset, I feel out of control.', options: BIG5_OPTIONS },
      { id: '3', text: 'When I am upset, I believe that I will remain that way for a long time.', options: BIG5_OPTIONS },
      { id: '4', text: 'When I am upset, I feel ashamed of myself for feeling that way.', options: BIG5_OPTIONS },
    ],
    scoring: (total) => {
      if (total >= 14) return { label: 'Regulation Difficulties', interpretation: 'Struggles with emotional oversight detected.', color: '#f97316', suggestions: ['DBT skills training', 'Mindfulness practice', 'Self-soothing techniques'] };
      return { label: 'Healthy Emotional Regulation', interpretation: 'Effective emotional management.', color: '#22c55e', suggestions: ['Maintain resilient habits'] };
    }
  },
  {
    id: 'emotional-intelligence',
    title: 'Emotional Intelligence Test',
    description: 'Measure your ability to perceive, understand, and manage emotions.',
    category: 'Psychology',
    questions: [
      { id: '1', text: 'I am aware of my emotions as I experience them.', options: BIG5_OPTIONS },
      { id: '2', text: 'I can easily recognize how others are feeling.', options: BIG5_OPTIONS },
      { id: '3', text: 'I am good at managing my stress under pressure.', options: BIG5_OPTIONS },
      { id: '4', text: 'I find it easy to empathize with people.', options: BIG5_OPTIONS },
      { id: '5', text: 'I can resolve conflicts effectively.', options: BIG5_OPTIONS },
    ],
    scoring: (total) => {
      if (total >= 20) return { label: 'High EQ', interpretation: 'Exceptional emotional maturity and social awareness.', color: '#22c55e', suggestions: ['Lead workshops', 'Conflict mediation'] };
      return { label: 'Developing EQ', interpretation: 'Good foundation with room for deeper self-awareness.', color: '#8b7cf6', suggestions: ['Reflective journaling', 'Active listening practice'] };
    }
  },
  {
    id: 'attachment-style',
    title: 'Attachment Style Test',
    description: 'Identify your attachment pattern in close relationships.',
    category: 'Relationship',
    questions: [
      { id: '1', text: 'I worry that my partner will leave me.', options: BIG5_OPTIONS },
      { id: '2', text: 'I find it difficult to trust others completely.', options: BIG5_OPTIONS },
      { id: '3', text: 'I prefer to be independent and self-reliant.', options: BIG5_OPTIONS },
      { id: '4', text: 'I am comfortable sharing my feelings with others.', options: BIG5_OPTIONS, reverse: true },
      { id: '5', text: 'I often feel overwhelmed by others’ emotions.', options: BIG5_OPTIONS },
    ],
    scoring: (total) => {
      if (total >= 18) return { label: 'Insecure Attachment', interpretation: 'Tendencies toward anxious or avoidant patterns.', color: '#f97316', suggestions: ['Therapeutic support for attachment', 'Secure base exercises'] };
      return { label: 'Secure Attachment', interpretation: 'Comfortable with intimacy and independence.', color: '#22c55e', suggestions: ['Maintain open communication'] };
    }
  },
  {
    id: 'productivity-blocker',
    title: 'Productivity Blocker Test',
    description: 'Identify what is stopping you from reaching your full potential.',
    category: 'Work',
    questions: [
      { id: '1', text: 'I am a perfectionist and struggle to finish things.', options: BIG5_OPTIONS },
      { id: '2', text: 'I get distracted easily by my environment.', options: BIG5_OPTIONS },
      { id: '3', text: 'I don’t have a clear set of goals.', options: BIG5_OPTIONS },
      { id: '4', text: 'I feel physically exhausted most of the time.', options: BIG5_OPTIONS },
      { id: '5', text: 'Fear of failure keeps me from starting.', options: BIG5_OPTIONS },
    ],
    scoring: (total) => {
      return { label: 'Blockers Identified', interpretation: 'Your primary blocker appears to be related to emotional or environmental factors.', color: '#f97316', suggestions: ['Task batching', 'Distraction-free environment', 'Work with a productivity coach'] };
    }
  },
  {
    id: 'tsq',
    title: 'Trauma Screening (TSQ)',
    description: 'A 10-item screening tool for post-traumatic stress symptoms.',
    category: 'Mental Health',
    questions: [
      { id: '1', text: 'Upsetting thoughts or memories about the event that have come into your mind against your will?', options: YES_NO_OPTIONS },
      { id: '2', text: 'Upsetting dreams about the event?', options: YES_NO_OPTIONS },
      { id: '3', text: 'Acting or feeling as though the event were happening again?', options: YES_NO_OPTIONS },
      { id: '4', text: 'Feeling upset by reminders of the event?', options: YES_NO_OPTIONS },
      { id: '5', text: 'Bodily reactions (such as fast heartbeat, stomach churning, sweatiness, dizziness) when reminded of the event?', options: YES_NO_OPTIONS },
    ],
    scoring: (total) => {
      if (total >= 3) return { label: 'Positive Screen', interpretation: 'Symptoms suggest significant impact from a traumatic event.', color: '#ef4444', suggestions: ['Consult trauma specialist', 'Self-care and stabilization'] };
      return { label: 'Negative Screen', interpretation: 'Trauma symptoms below clinical threshold.', color: '#22c55e', suggestions: ['Continue standard wellness routine'] };
    }
  },
  {
    id: 'cfq',
    title: 'Cognitive Failures (CFQ)',
    description: 'Assess how often you experience "slips and lapses" in daily life.',
    category: 'Psychology',
    questions: [
      { id: '1', text: 'Do you find you forget why you went from one part of the house to the other?', options: PSQI_OPTIONS },
      { id: '2', text: 'Do you fail to notice signposts on the road?', options: PSQI_OPTIONS },
      { id: '3', text: 'Do you find you confuse right and left when giving directions?', options: PSQI_OPTIONS },
      { id: '4', text: 'Do you bump into people?', options: PSQI_OPTIONS },
      { id: '5', text: 'Do you find you forget what you came to the shop to buy?', options: PSQI_OPTIONS },
    ],
    scoring: (total) => {
      if (total >= 10) return { label: 'High Cognitive Load', interpretation: 'Frequent cognitive lapses detected.', color: '#f97316', suggestions: ['Review sleep and stress levels', 'Use external memory aids', 'Focus on single-tasking'] };
      return { label: 'Normal Cognitive Function', interpretation: 'Typical range of daily slips.', color: '#22c55e', suggestions: ['Maintain current cognitive habits'] };
    }
  }
];
