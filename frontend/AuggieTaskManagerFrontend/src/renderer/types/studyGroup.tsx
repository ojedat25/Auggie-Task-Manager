export interface StudyGroup {
  groupID: number;
  name: string;
  description: string;
  image: string | null;
  private: boolean;
  members: number[];
  created_by: number;
  created_at: string;
}
