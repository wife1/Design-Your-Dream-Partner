export type Character = {
  id: string;
  name: string;
  gender: string;
  age: number;
  relationship: string;
  voice: string;
  style: string;
  hairColor: string;
  eyeColor: string;
  ethnicity: string;
  bodyType: string;
  personality: string[];
  bio: string;
  imageUrl?: string;
  profileImageUrl?: string;
};

export type Message = {
  id?: string;
  role: "user" | "model";
  text: string;
  gif?: string;
  status?: "sent" | "read";
  isTyping?: boolean;
};
