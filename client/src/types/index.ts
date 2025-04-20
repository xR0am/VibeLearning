export interface Step {
  id: number;
  title: string;
  content: string;
}

export interface CourseContent {
  title: string;
  repoUrl: string;
  context: string;
  steps: Step[];
}

export interface GenerateCourseRequest {
  repoUrl: string;
  context: string;
  model: string;
}

export interface OpenRouterModel {
  id: string;
  name: string;
}

export interface Example {
  title: string;
  repoUrl: string;
  model: string;
  tags: string[];
  url?: string;
}
