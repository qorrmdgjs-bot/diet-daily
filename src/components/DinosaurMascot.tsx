'use client';

import { useState, useEffect } from 'react';

interface DinosaurMascotProps {
  message?: string;
}

const messages = {
  input: [
    '체중 입력 고마워요! 🐶',
    '오늘도 잘했어요! 계속해요! 🐶',
    '기록이 쌓이면 더 정확해져요.',
  ],
  weightDown: [
    '체중이 줄었어요! 🎉',
    '정말 잘하고 있어요! 💪',
    '좋은 흐름이에요! 계속 가봐요.',
  ],
  weightUp: [
    '괜찮아요, 내일 또 도전해요. 😊',
    '작은 변화도 의미 있어요.',
    '포기하지 말고 천천히 가요.',
  ],
  goalAchieved: [
    '목표 달성 축하해요! 🎊',
    '정말 대단해요! 🐶',
    '이제 새로운 목표를 세워봐요.',
  ],
  welcome: [
    '안녕하세요! 체중 관리를 시작해볼까요? 🐶',
    '꾸준함이 승리의 열쇠예요.',
    '함께 건강해져요!',
  ],
};

export default function DinosaurMascot({ message }: DinosaurMascotProps) {
  const [currentMessage, setCurrentMessage] = useState('');

  useEffect(() => {
    if (message) {
      setCurrentMessage(message);
      const timer = setTimeout(() => setCurrentMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const getRandomMessage = (type: keyof typeof messages) => {
    const msgs = messages[type];
    return msgs[Math.floor(Math.random() * msgs.length)];
  };

  return (
    <div className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 z-50">
      {currentMessage && (
        <div className="relative mb-1 sm:mb-2">
          <div className="bg-pink-100 text-pink-700 px-3 py-2 sm:px-4 sm:py-2 rounded-xl shadow-lg max-w-[200px] sm:max-w-xs text-sm sm:text-base border border-pink-200">
            {currentMessage}
          </div>
          <div className="absolute top-full right-2 sm:right-4 w-0 h-0 border-l-2 border-r-2 border-t-2 sm:border-l-4 sm:border-r-4 sm:border-t-4 border-transparent border-t-pink-100"></div>
        </div>
      )}
      <div className="text-4xl sm:text-5xl">🐶</div>
    </div>
  );
}

export { messages };