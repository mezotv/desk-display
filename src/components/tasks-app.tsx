import { useState } from "react";

import { TouchAppShell } from "@/components/touch-app-shell";
import { TouchKeyboard } from "@/components/touch-keyboard";
import {
  MAX_DISPLAY_TASKS,
  MAX_TASK_LENGTH,
  PRODUCTIVITY_COPY,
} from "@/constants/productivity";
import type { TasksAppProps } from "@/types/productivity";

export function TasksApp({
  language,
  onAdd,
  onClearCompleted,
  onDelete,
  onHome,
  onToggle,
  tasks,
}: TasksAppProps) {
  const [addingTask, setAddingTask] = useState(false);
  const copy = PRODUCTIVITY_COPY[language];

  if (addingTask) {
    return (
      <TouchKeyboard
        language={language}
        maxLength={MAX_TASK_LENGTH}
        onCancel={() => setAddingTask(false)}
        onSave={(title) => {
          if (title) onAdd(title);
          setAddingTask(false);
        }}
        placeholder={copy.tasks}
        value=""
      />
    );
  }

  const completedCount = tasks.filter((task) => task.completed).length;

  return (
    <TouchAppShell
      accent="#34d399"
      icon="/logos/tasks-pixel.svg"
      onHome={onHome}
      title={copy.tasks}
    >
      <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-[clamp(8px,1.5vh,14px)]">
        {tasks.length === 0 ? (
          <div className="grid place-items-center text-[clamp(34px,min(5vw,8vh),64px)] font-extrabold tracking-[0.04em] text-[#555560]">
            {copy.emptyTasks}
          </div>
        ) : (
          <div className="no-scrollbar grid min-h-0 auto-rows-[clamp(50px,9vh,72px)] content-start gap-[clamp(6px,1vh,10px)] overflow-y-auto pr-1">
            {tasks.map((task) => (
              <article
                className={`grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[clamp(10px,1.5vw,18px)] rounded-[11px] border px-[clamp(10px,1.6vw,20px)] ${
                  task.completed
                    ? "border-[#202027] bg-[#0d0d11]"
                    : "border-[#26352f] bg-display-panel"
                }`}
                key={task.id}
              >
                <button
                  aria-label={copy.completed}
                  className={`grid size-[clamp(30px,4vw,44px)] touch-manipulation place-items-center rounded-[8px] border-2 text-[clamp(18px,2.6vw,28px)] font-extrabold outline-none active:scale-[0.94] ${
                    task.completed
                      ? "border-emerald-400 bg-emerald-400 text-display-bg"
                      : "border-[#4a4a55] bg-transparent text-transparent"
                  }`}
                  onClick={() => onToggle(task.id)}
                  type="button"
                >
                  ✓
                </button>
                <button
                  className={`min-w-0 overflow-hidden border-0 bg-transparent text-left text-[clamp(20px,min(2.8vw,4.6vh),34px)] font-bold text-ellipsis whitespace-nowrap outline-none ${
                    task.completed
                      ? "text-[#555561] line-through"
                      : "text-display-text"
                  }`}
                  onClick={() => onToggle(task.id)}
                  type="button"
                >
                  {task.title}
                </button>
                <button
                  aria-label="Delete"
                  className="size-[clamp(32px,4vw,44px)] touch-manipulation rounded-[8px] border-0 bg-[#17171d] text-[clamp(18px,2.5vw,27px)] font-bold text-[#777782] outline-none active:scale-[0.94] active:bg-[#2a1518] active:text-red-400"
                  onClick={() => onDelete(task.id)}
                  type="button"
                >
                  ×
                </button>
              </article>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            className="min-h-[clamp(48px,8.5vh,66px)] touch-manipulation rounded-[11px] border-0 bg-emerald-400 text-[clamp(18px,min(2.6vw,4.3vh),30px)] font-extrabold text-display-bg outline-none active:scale-[0.97] disabled:opacity-35"
            disabled={tasks.length >= MAX_DISPLAY_TASKS}
            onClick={() => setAddingTask(true)}
            type="button"
          >
            {copy.addTask}
          </button>
          <button
            className="min-h-[clamp(48px,8.5vh,66px)] touch-manipulation rounded-[11px] border-0 bg-[#17171d] text-[clamp(16px,min(2.2vw,3.7vh),26px)] font-bold text-[#858590] outline-none active:scale-[0.97] active:bg-[#282833] disabled:opacity-35"
            disabled={completedCount === 0}
            onClick={onClearCompleted}
            type="button"
          >
            {copy.clearDone}
          </button>
        </div>
      </div>
    </TouchAppShell>
  );
}
