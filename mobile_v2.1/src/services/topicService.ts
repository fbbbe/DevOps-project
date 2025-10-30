// src/services/topicService.ts
import api from './api';

export type SubjectOption = { label: string; value: string };
export type TopicRow = {
  TOPIC_ID: number; CODE: string; NAME_KO: string;
  TITLE: string; BODY?: string; CREATED_AT?: string;
};

export async function fetchTopicOptions(): Promise<SubjectOption[]> {
  return await api.get('/topics/options');
}

export async function fetchTopics(): Promise<TopicRow[]> {
  return await api.get('/topics');
}
