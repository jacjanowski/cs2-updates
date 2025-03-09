
import { UpdateData } from "@/components/UpdateCard";

export interface SteamEvent {
  announcement_body: {
    gid: string;
    clanid: string;
    posterid: string;
    headline: string;
    posttime: number;
    updatetime: number;
    body: string;
  };
  event_description: string;
  event_name: string;
  event_type: number;
  rtime32_start_time: number;
  rtime32_end_time: number;
  display_event: boolean;
  event_gid: string;
  left_icon_text: string;
  jsondata: string;
  steamstoreitem: object[];
}

export interface SteamResponse {
  success: boolean;
  events: SteamEvent[];
  strAvatar?: string;
}
