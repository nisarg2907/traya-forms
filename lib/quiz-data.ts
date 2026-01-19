export type QuestionType = "text" | "single" | "multiple" | "gender" | "upload" | "image";

export interface QuizOption {
  id: string;
  label: string;
  subLabel?: string;
  images?: string[]; // Array of image URLs (typically 2: front and top view)
}

export interface QuizQuestion {
  id: string;
  section: number;
  question: string;
  type: QuestionType;
  options?: QuizOption[];
  placeholder?: string;
  disclaimer?: string;
}

export const sections = [
  { id: 1, title: "About", subtitle: "You" },
  { id: 2, title: "Hair", subtitle: "Health" },
  { id: 3, title: "Internal", subtitle: "Health" },
  { id: 4, title: "Scalp", subtitle: "Assessment" },
];

export const questions: QuizQuestion[] = [
  // Section 1: About You (0-12%)
  {
    id: "name",
    section: 1,
    question: "Before we start, can we get your name?",
    type: "text",
    placeholder: "",
    disclaimer: "*Your data is safe with us. We follow strict security measures to protect your privacy and never share your information without consent.",
  },
  {
    id: "phone",
    section: 1,
    question: "Phone Number",
    type: "text",
    placeholder: "",
    disclaimer: "*Your contact details will be used by Traya hair coach to reach out to you via call/sms/whatsapp.",
  },
  {
    id: "gender",
    section: 1,
    question: "Gender",
    type: "gender",
    options: [
      { id: "male", label: "Male" },
      { id: "female", label: "Female" },
    ],
  },
  // Section 2: Hair Health (44%)
  {
    id: "hair-loss-stage",
    section: 2,
    question: "Which image best describes your hair loss?",
    type: "image",
    options: [
      {
        id: "stage-1",
        label: "Stage-1",
        images: [
          "https://dvv8w2q8s3qot.cloudfront.net/website_images/assets/male/stage1/image_m_1.webp",
          "https://dvv8w2q8s3qot.cloudfront.net/website_images/assets/male/stage1/image_m_2.webp",
        ],
      },
      {
        id: "stage-2",
        label: "Stage-2",
        images: [
          "https://dvv8w2q8s3qot.cloudfront.net/website_images/assets/male/stage2/image_m_1.webp",
          "https://dvv8w2q8s3qot.cloudfront.net/website_images/assets/male/stage2/image_m_2.webp",
        ],
      },
      {
        id: "stage-3",
        label: "Stage-3",
        images: [
          "https://dvv8w2q8s3qot.cloudfront.net/website_images/assets/male/stage3/image_m_1.webp",
          "https://dvv8w2q8s3qot.cloudfront.net/website_images/assets/male/stage3/image_m_2.webp",
        ],
      },
      {
        id: "stage-4",
        label: "Stage-4",
        images: [
          "https://dvv8w2q8s3qot.cloudfront.net/website_images/assets/male/stage4/image_m_1.webp",
          "https://dvv8w2q8s3qot.cloudfront.net/website_images/assets/male/stage4/image_m_2.webp",
        ],
      },
      {
        id: "stage-5",
        label: "Stage-5",
        images: [
          "https://dvv8w2q8s3qot.cloudfront.net/website_images/assets/male/stage5/image_m_1.webp",
          "https://dvv8w2q8s3qot.cloudfront.net/website_images/assets/male/stage5/image_m_2.webp",
        ],
      },
      {
        id: "stage-6",
        label: "Stage-6",
        images: [
          "https://dvv8w2q8s3qot.cloudfront.net/website_images/assets/male/stage6/image_m_1.webp",
          "https://dvv8w2q8s3qot.cloudfront.net/website_images/assets/male/stage6/image_m_2.webp",
        ],
      },
      {
        id: "coin-size-patch",
        label: "Coin Size Patch",
        images: [
          "https://dvv8w2q8s3qot.cloudfront.net/website_images/assets/male/coinSizePatch/image_m_1.webp",
          "https://dvv8w2q8s3qot.cloudfront.net/website_images/assets/male/coinSizePatch/image_m_2.webp",
        ],
      },
      {
        id: "heavy-hair-fall",
        label: "Heavy Hair Fall",
        images: [
          "https://dvv8w2q8s3qot.cloudfront.net/website_images/assets/male/heavyHairFall/image_m_1.webp",
          "https://dvv8w2q8s3qot.cloudfront.net/website_images/assets/male/heavyHairFall/image_m_2.webp",
        ],
      },
    ],
  },
  {
    id: "dandruff",
    section: 2,
    question: "Do you have dandruff?",
    type: "single",
    options: [
      { id: "no", label: "No" },
      { id: "mild", label: "Mild dandruff (small white flakes)" },
      { id: "heavy", label: "Heavy dandruff (sticky dandruff found in nails on scratching or visible on clothes)" },
      { id: "psoriasis", label: "Diagnosed with Psoriasis / Seborrheic Dermatitis", subLabel: "A skin condition that causes red, dry patches on your scalp." },
    ],
  },
  // Section 3: Internal Health (50-88%)
  {
    id: "sleep",
    section: 3,
    question: "How well do you sleep?",
    type: "single",
    options: [
      { id: "peaceful", label: "Very peacefully for 6-8 hours" },
      { id: "disturbed", label: "Disturbed sleep (wake up multiple times at night)" },
      { id: "difficulty", label: "Difficulty falling asleep" },
    ],
  },
  {
    id: "stress",
    section: 3,
    question: "How stressed are you?",
    type: "single",
    options: [
      { id: "none", label: "None" },
      { id: "low", label: "Low" },
      { id: "moderate", label: "Moderate(work, family etc )" },
      { id: "high", label: "High (Loss of close one, separation, home, illness)" },
    ],
  },
  {
    id: "constipation",
    section: 3,
    question: "Do you feel constipated? (कब्ज़)",
    type: "single",
    options: [
      { id: "no", label: "No / Once in a while" },
      { id: "yes", label: "Yes (fewer than 3 stools a week)" },
      { id: "unable", label: "Unable to pass stool properly / feeling unsatisfied after passing stools" },
      { id: "ibs", label: "Suffering from Irritable Bowel Syndrome" },
    ],
  },
  {
    id: "gas",
    section: 3,
    question: "Do you have Gas, Acidity or Bloating?",
    type: "single",
    options: [
      { id: "no", label: "No" },
      { id: "sometimes", label: "Sometimes (1-2 times a week or when I eat out)" },
      { id: "often", label: "Often (3+ times a week)" },
    ],
  },
  {
    id: "energy",
    section: 3,
    question: "How are your energy levels during the day?",
    type: "single",
    options: [
      { id: "high", label: "Always high / Normal energy levels throughout the day" },
      { id: "low-morning", label: "Low when I wake up, then gradually increase" },
      { id: "low-afternoon", label: "Very low in the afternoon" },
      { id: "low-evening", label: "Low by evening/night" },
      { id: "always-low", label: "Always low" },
    ],
  },
  {
    id: "supplements",
    section: 3,
    question: "Are you currently taking any supplements or vitamins for hair?",
    type: "single",
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" },
    ],
  },
  // Section 4: Scalp Assessment (94%)
  {
    id: "scalp-photo",
    section: 4,
    question: "Upload your scalp picture, for our hair experts to check.",
    type: "upload",
  },
];

export function getSectionProgress(currentQuestion: number): number {
  const totalQuestions = questions.length;
  return Math.round((currentQuestion / totalQuestions) * 100);
}

export function getCurrentSection(questionIndex: number): number {
  if (questionIndex >= questions.length) return 4;
  return questions[questionIndex].section;
}
