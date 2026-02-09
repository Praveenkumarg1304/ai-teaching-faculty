
import React from 'react';
import { Teacher } from '../types';

interface Props {
  teacher: Teacher;
  isActive?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const TeacherAvatar: React.FC<Props> = ({ teacher, isActive, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-xl',
    lg: 'w-20 h-20 text-4xl'
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`
        ${sizeClasses[size]}
        ${teacher.color}
        rounded-full flex items-center justify-center text-white shadow-xl
        transition-all duration-500
        ${isActive ? 'ring-4 ring-indigo-500/40 ring-offset-2 ring-offset-black scale-110 shadow-indigo-500/20 animate-pulse-soft' : 'opacity-40 grayscale-[0.3]'}
      `}>
        {teacher.avatar}
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 ${isActive ? 'text-indigo-400' : 'text-slate-600'}`}>
        {teacher.name}
      </span>
    </div>
  );
};

export default TeacherAvatar;
