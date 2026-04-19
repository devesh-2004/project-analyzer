export interface ProjectExplanationResult {
  overview: string;
  architecture: string;
  dataFlow: string;
  folderStructureExplanation: {
    folderName: string;
    description: string;
  }[];
  keyFiles: {
    path: string;
    role: string;
  }[];
}
