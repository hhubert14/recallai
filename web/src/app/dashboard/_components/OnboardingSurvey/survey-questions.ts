export type QuestionOption = {
  value: string;
  label: string;
};

export type SurveyQuestionConfig = {
  id: string;
  question: string;
  options: QuestionOption[];
  multiSelect?: boolean;
  showOther?: boolean;
};

export const SURVEY_QUESTIONS: SurveyQuestionConfig[] = [
  {
    id: "primaryGoal",
    question: "What's your primary goal with Retenio?",
    options: [
      { value: "exam_prep", label: "Prepare for exams or certifications" },
      { value: "retention", label: "Remember what I learn long-term" },
      { value: "career", label: "Upskill for my career" },
      {
        value: "personal_growth",
        label: "Explore new topics for personal growth",
      },
      { value: "exploring", label: "Just exploring the platform" },
    ],
    showOther: true,
  },
  {
    id: "userRole",
    question: "Which of these best describes you?",
    options: [
      { value: "high_school", label: "High School Student" },
      { value: "college_student", label: "College/University Student" },
      { value: "grad_student", label: "Graduate Student (Master's/PhD)" },
      { value: "working_professional", label: "Working Professional" },
      { value: "educator", label: "Educator or Trainer" },
      { value: "self_employed", label: "Self-employed/Entrepreneur" },
      {
        value: "not_working_studying",
        label: "Not currently working or studying",
      },
    ],
    showOther: true,
  },
  {
    id: "referralSource",
    question: "How did you discover Retenio?",
    options: [
      { value: "friend", label: "Friend or colleague recommendation" },
      { value: "social_media", label: "Social media (Reddit, Twitter, etc.)" },
      { value: "search", label: "Online search (Google, Bing, etc.)" },
      { value: "youtube", label: "YouTube" },
      { value: "school", label: "School or university" },
    ],
    showOther: true,
  },
  {
    id: "topics",
    question: "What subjects or topics do you most want to learn with Retenio?",
    options: [
      { value: "stem", label: "STEM (Science, Technology, Engineering, Math)" },
      { value: "languages", label: "Language learning" },
      { value: "business", label: "Business/Finance" },
      { value: "arts", label: "Arts/Humanities" },
      { value: "test_prep", label: "Test preparation (GRE, SAT, etc.)" },
    ],
    multiSelect: true,
    showOther: true,
  },
  {
    id: "primaryDevice",
    question: "What device do you primarily use for learning?",
    options: [
      { value: "desktop", label: "Desktop/laptop" },
      { value: "tablet", label: "Tablet" },
      { value: "phone", label: "Mobile phone" },
    ],
    showOther: true,
  },
  {
    id: "interestedFeatures",
    question: "Which features are you most interested in?",
    options: [
      { value: "ai_flashcards", label: "AI-generated flashcards and quizzes" },
      { value: "ai_tutor", label: "AI Tutor (practice explaining concepts)" },
      { value: "spaced_repetition", label: "Spaced repetition review" },
      { value: "progress_tracking", label: "Progress tracking and streaks" },
      { value: "video_summaries", label: "Video summaries and chatbot" },
    ],
    multiSelect: true,
    showOther: true,
  },
  {
    id: "ageRange",
    question: "What is your age range?",
    options: [
      { value: "under_18", label: "Under 18" },
      { value: "18_24", label: "18-24" },
      { value: "25_34", label: "25-34" },
      { value: "35_44", label: "35-44" },
      { value: "45_54", label: "45-54" },
      { value: "55_plus", label: "55 or older" },
      { value: "prefer_not", label: "Prefer not to say" },
    ],
  },
  {
    id: "willingToBeta",
    question:
      "Would you be willing to participate in beta testing or feedback groups?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
      { value: "maybe", label: "Maybe" },
    ],
  },
];
