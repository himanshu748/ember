export type Embodiment = "object" | "the_passion_itself" | "younger_self";
export type Temperament =
  | "wistful"
  | "wry"
  | "defiant"
  | "patient"
  | "bitter"
  | "hopeful";
export type Verdict = "rekindled" | "laid_to_rest" | "undecided";

export interface Persona {
  /** What speaks — e.g. "Your old Kashmir-willow bat" */
  name: string;
  embodiment: Embodiment;
  temperament: Temperament;
  openingLine: string;
  systemPrompt: string;
}

export interface ChatTurn {
  role: "user" | "passion";
  text: string;
}

export interface SessionRecord {
  id: string;
  passionLabel: string;
  passionCategory: string; // music|sport|writing|art|craft|language|other
  yearsActive: number | null;
  yearsDormant: number | null;
  abandonmentReason: string; // time|money|fear|injury|life_event|lost_joy|other
  ageAtAbandonment: number | null;
  emotionalTone: string; // wistful|bitter|guilty|peaceful
  confession: string;
  persona: Persona;
  verdict: Verdict;
  verdictText: string | null; // eulogy text or negotiated first step
  pledgeTx: string | null;
  createdAt: string;
}

export interface AtlasStats {
  total: number;
  rekindled: number;
  laidToRest: number;
  topPassions: { label: string; count: number }[];
  byCategory: { category: string; count: number }[];
  byReason: { reason: string; count: number }[];
  avgYearsDormant: number;
  source: "snowflake" | "local";
}
