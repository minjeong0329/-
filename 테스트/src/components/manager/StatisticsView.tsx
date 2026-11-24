import React from 'react';
import { Task, FocusSession, DelayEvent, CATEGORY_META } from '../../types';
import { BarChart3, Clock, AlertTriangle, TrendingUp, Award } from 'lucide-react';

interface StatisticsViewProps {
  tasks: Task[];
  focusSessions: FocusSession[];
  delayEvents: DelayEvent[];
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  tasks,
  focusSessions,
  delayEvents,
}) => {
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const totalTasks = tasks.length;

  // Genuine record check: If user hasn't recorded enough real actions, honestly display notice
  const isDataSufficient = completedTasks.length >= 2 || focusSessions.length >= 2;

  if (!isDataSufficient) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-[#E3DFD4] shadow-soft text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#F4F2E9] flex items-center justify-center mx-auto text-xl">
          📊
        </div>
        <h3 className="text-base font-bold text-[#292D27]">
          아직 분석에 필요한 데이터가 쌓이지 않았어요
        </h3>
        <p className="text-xs text-[#686E63] leading-relaxed max-w-[260px] mx-auto">
          가상의 통계 대신 사용자의 실제 기록만을 분석합니다. 작업을 2개 이상 완료하고 집중 타이머를 사용해 보세요!
        </p>
      </div>
    );
  }

  // Calculate real metrics
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  // Total Focus Minutes
  const totalFocusMinutes = focusSessions.reduce((acc, s) => {
    return acc + Math.round((s.actualSeconds || 0) / 60);
  }, 0);

  // Delay Breakdown by Category
  const delaysByCategory: Record<string, number> = {};
  delayEvents.forEach((d) => {
    const matchedTask = tasks.find((t) => t.id === d.taskId);
    const cat = matchedTask?.category || 'work';
    delaysByCategory[cat] = (delaysByCategory[cat] || 0) + 1;
  });

  // Top delayed category
  let topDelayedCat = '없음';
  let topDelayedCount = 0;
  Object.entries(delaysByCategory).forEach(([cat, count]) => {
    if (count > topDelayedCount) {
      topDelayedCount = count;
      topDelayedCat = CATEGORY_META[cat as keyof typeof CATEGORY_META]?.label || cat;
    }
  });

  // Estimated vs Actual comparison for completed tasks
  const tasksWithActual = completedTasks.filter((t) => t.actualMinutes > 0);
  const totalEstimated = tasksWithActual.reduce((acc, t) => acc + t.estimatedMinutes, 0);
  const totalActual = tasksWithActual.reduce((acc, t) => acc + t.actualMinutes, 0);

  return (
    <div className="space-y-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-[#E3DFD4] shadow-soft">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#778C59] mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>작업 완료율</span>
          </div>
          <div className="text-2xl font-black text-[#292D27]">{completionRate}%</div>
          <div className="text-[11px] text-[#858B7E] mt-0.5">
            {completedTasks.length} / {totalTasks}개 완료
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E3DFD4] shadow-soft">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#586A41] mb-1">
            <Clock className="w-4 h-4" />
            <span>누적 집중 시간</span>
          </div>
          <div className="text-2xl font-black text-[#292D27]">{totalFocusMinutes}분</div>
          <div className="text-[11px] text-[#858B7E] mt-0.5">
            총 {focusSessions.length}회 세션 진행
          </div>
        </div>
      </div>

      {/* Procrastination Analysis Card */}
      <div className="bg-white p-4 rounded-2xl border border-[#E3DFD4] shadow-soft space-y-3">
        <h4 className="text-xs font-bold text-[#292D27] flex items-center space-x-1.5">
          <AlertTriangle className="w-4 h-4 text-[#B35D43]" />
          <span>미루기 패턴 진단</span>
        </h4>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-[#FAF9F5] p-3 rounded-xl border border-[#E8E5D8]">
            <span className="text-[#858B7E] block text-[11px]">총 지연 감지 횟수</span>
            <span className="text-base font-bold text-[#B35D43] mt-0.5 block">
              {delayEvents.length}회
            </span>
          </div>
          <div className="bg-[#FAF9F5] p-3 rounded-xl border border-[#E8E5D8]">
            <span className="text-[#858B7E] block text-[11px]">자주 미루는 분야</span>
            <span className="text-base font-bold text-[#292D27] mt-0.5 block truncate">
              {topDelayedCat}
            </span>
          </div>
        </div>

        {/* Delay Reason Distribution if events exist */}
        {delayEvents.length > 0 && (
          <div className="pt-1">
            <span className="text-[11px] font-semibold text-[#686E63] block mb-1.5">
              주요 지연 원인 빈도
            </span>
            <div className="space-y-1 text-xs">
              {['reluctance', 'difficulty', 'other_work', 'need_more_time', 'unwell'].map((reasonKey) => {
                const count = delayEvents.filter((d) => d.reason === reasonKey).length;
                if (count === 0) return null;
                const labels: Record<string, string> = {
                  reluctance: '하기 싫음 (미세 시작 필요)',
                  difficulty: '너무 어려움 (작업 쪼개기)',
                  other_work: '다른 급한 일 진행',
                  need_more_time: '시간 부족',
                  unwell: '컨디션 난조',
                };
                return (
                  <div key={reasonKey} className="flex items-center justify-between bg-[#F8F7F2] px-2.5 py-1.5 rounded-lg">
                    <span className="text-[#292D27]">{labels[reasonKey]}</span>
                    <span className="font-bold text-[#778C59]">{count}회</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Estimated vs Actual Time comparison */}
      {tasksWithActual.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-[#E3DFD4] shadow-soft space-y-2">
          <h4 className="text-xs font-bold text-[#292D27] flex items-center space-x-1.5">
            <BarChart3 className="w-4 h-4 text-[#778C59]" />
            <span>예상 소요 시간 vs 실제 소요 시간</span>
          </h4>
          <p className="text-[11px] text-[#686E63]">
            계획된 총 예상 시간: <span className="font-bold">{totalEstimated}분</span> / 실제 소요 시간: <span className="font-bold">{totalActual}분</span>
          </p>
        </div>
      )}
    </div>
  );
};
