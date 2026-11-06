// ============================================================================
// B10 / DEV-FE-010: NEXT.JS APP ROUTER + TYPESCRIPT CODE SAMPLES
// Bao gồm: Metadata API, Server Component, Client Component, Middleware & Server Actions
// ============================================================================

import React, { Suspense } from 'react';

// ----------------------------------------------------------------------------
// 1. ĐỊNH KIỂU TYPESCRIPT CHO NEXT.JS APP ROUTER (Strict Type Safety)
// ----------------------------------------------------------------------------

export interface NextMetadata {
  title: string | { default: string; template: string };
  description: string;
  keywords?: string[];
  openGraph?: {
    title: string;
    description: string;
    type: 'website' | 'article';
  };
}

export interface PageProps<
  TParams extends Record<string, string | string[]> = Record<string, never>,
  TSearchParams extends Record<string, string | string[] | undefined> = Record<string, undefined>
> {
  params: Promise<TParams>;
  searchParams: Promise<TSearchParams>;
}

export interface LessonModuleItem {
  id: string;
  code: 'B4' | 'B5' | 'B6' | 'B7' | 'B8' | 'B9' | 'B10' | 'B11';
  title: string;
  category: 'React' | 'Architecture' | 'TypeScript' | 'Performance' | 'State' | 'DataFetching' | 'NextJS' | 'FormHandling';
  points: number;
  isCompleted: boolean;
}

export interface ActionResponse<TData = unknown> {
  success: boolean;
  message: string;
  data?: TData;
  fieldErrors?: Record<string, string[]>;
}

// ----------------------------------------------------------------------------
// 2. STATIC METADATA CONFIGURATION (`app/dashboard/page.tsx`)
// ----------------------------------------------------------------------------

export const metadata: NextMetadata = {
  title: {
    default: 'Hệ Thống Bài Tập B4 - B11 | Next.js + TypeScript Portal',
    template: '%s | FE Intern Portal'
  },
  description: 'Cổng thực hành Frontend hiện đại với Next.js App Router, TypeScript, Zustand, TanStack Query và React Hook Form.',
  keywords: ['Next.js 15', 'TypeScript', 'React Server Components', 'Form Handling', 'Zod']
};

// ----------------------------------------------------------------------------
// 3. SERVER COMPONENT (`app/dashboard/page.tsx`)
// Mặc định trong App Router là React Server Component (RSC) -> Có thể async/await trực tiếp!
// ----------------------------------------------------------------------------

async function fetchLessonsOnServer(): Promise<LessonModuleItem[]> {
  // Trong Next.js thực tế: fetch('https://api.example.com/lessons', { next: { revalidate: 60 } })
  return [
    { id: '4', code: 'B4', title: 'React Fundamentals', category: 'React', points: 8, isCompleted: true },
    { id: '5', code: 'B5', title: 'Internal Module Architecture', category: 'Architecture', points: 8, isCompleted: true },
    { id: '6', code: 'B6', title: 'TypeScript Integration (>90% coverage)', category: 'TypeScript', points: 8, isCompleted: true },
    { id: '7', code: 'B7', title: 'React Advanced Performance', category: 'Performance', points: 8, isCompleted: true },
    { id: '8', code: 'B8', title: 'State Management (Zustand & RTK)', category: 'State', points: 8, isCompleted: true },
    { id: '9', code: 'B9', title: 'TanStack Query (Server State)', category: 'DataFetching', points: 8, isCompleted: true },
    { id: '10', code: 'B10', title: 'Next.js App Router + TypeScript', category: 'NextJS', points: 10, isCompleted: true },
    { id: '11', code: 'B11', title: 'Form Handling (React Hook Form + Zod)', category: 'FormHandling', points: 10, isCompleted: true }
  ];
}

export default async function DashboardServerPage({
  searchParams
}: PageProps<Record<string, never>, { filter?: string }>) {
  const resolvedSearchParams = await searchParams;
  const lessons = await fetchLessonsOnServer();

  const filteredLessons = resolvedSearchParams.filter
    ? lessons.filter(item => item.category.toLowerCase() === resolvedSearchParams.filter?.toLowerCase())
    : lessons;

  return (
    <main className="container mx-auto p-6 space-y-6">
      <header className="flex justify-between items-center border-b pb-4">
        <div>
          <span className="text-xs font-mono uppercase text-indigo-500">React Server Component (0kB Client Bundle)</span>
          <h1 className="text-2xl font-bold">Danh Sách Bài Tập Thực Hành (B4 — B11)</h1>
        </div>
      </header>

      <Suspense fallback={<div className="p-6 animate-pulse bg-slate-800 rounded-xl">Đang stream dữ liệu bài tập...</div>}>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredLessons.map(lesson => (
            <article key={lesson.id} className="p-4 rounded-xl border border-slate-700 bg-slate-900">
              <span className="text-xs font-bold text-indigo-400">{lesson.code}</span>
              <h3 className="font-semibold text-white mt-1">{lesson.title}</h3>
              <p className="text-xs text-slate-400 mt-2">Task Points: {lesson.points}</p>
            </article>
          ))}
        </div>
      </Suspense>
    </main>
  );
}

