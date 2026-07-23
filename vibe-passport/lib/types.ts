export type MoodKey =
  | "chill"
  | "hyped"
  | "lonely"
  | "grateful"
  | "adventurous"
  | "nostalgic"
  | "lovestruck"
  | "wild";

export interface Mood {
  key: MoodKey;
  label: string;
  emoji: string;
  color: string; // hex used for stamp ring + map pin
}

export interface Stamp {
  id: string;
  userId: string;
  userName: string;
  photoUrl: string;
  audioUrl: string;
  mood: MoodKey;
  caption: string;
  locationName: string;
  lat: number;
  lng: number;
  createdAt: number;
}

export interface VibeUser {
  id: string;
  email: string;
  name: string;
}

// Shape of a row as it comes back from the `stamps` table
export interface StampRow {
  id: string;
  user_id: string;
  user_name: string;
  mood: string;
  caption: string;
  location_name: string;
  lat: number;
  lng: number;
  photo_url: string;
  audio_url: string;
  created_at: string;
}

export function rowToStamp(row: StampRow): Stamp {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    mood: row.mood as MoodKey,
    caption: row.caption,
    locationName: row.location_name,
    lat: row.lat,
    lng: row.lng,
    photoUrl: row.photo_url,
    audioUrl: row.audio_url,
    createdAt: new Date(row.created_at).getTime(),
  };
}
