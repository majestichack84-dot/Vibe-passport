import { supabase } from "./supabase";
import { MoodKey, Stamp, StampRow, rowToStamp } from "./types";

export async function fetchStamps(): Promise<Stamp[]> {
  const { data, error } = await supabase
    .from("stamps")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as StampRow[]).map(rowToStamp);
}

/** Subscribes to newly inserted stamps in realtime. Returns an unsubscribe fn. */
export function subscribeToNewStamps(onInsert: (stamp: Stamp) => void) {
  const channel = supabase
    .channel("stamps-feed")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "stamps" },
      (payload) => onInsert(rowToStamp(payload.new as StampRow))
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

interface NewStampInput {
  userId: string;
  userName: string;
  photoFile: File;
  audioBlob: Blob | null;
  mood: MoodKey;
  caption: string;
  locationName: string;
  lat: number;
  lng: number;
}

async function uploadToBucket(
  bucket: "stamp-photos" | "stamp-audio",
  userId: string,
  file: Blob,
  extension: string
): Promise<string> {
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function createStamp(input: NewStampInput): Promise<Stamp> {
  const photoUrl = await uploadToBucket(
    "stamp-photos",
    input.userId,
    input.photoFile,
    input.photoFile.type.split("/")[1] || "jpg"
  );

  const audioUrl = input.audioBlob
    ? await uploadToBucket("stamp-audio", input.userId, input.audioBlob, "webm")
    : "";

  const { data, error } = await supabase
    .from("stamps")
    .insert({
      user_id: input.userId,
      user_name: input.userName,
      mood: input.mood,
      caption: input.caption,
      location_name: input.locationName,
      lat: input.lat,
      lng: input.lng,
      photo_url: photoUrl,
      audio_url: audioUrl,
    })
    .select("*")
    .single();

  if (error) throw error;
  return rowToStamp(data as StampRow);
}
