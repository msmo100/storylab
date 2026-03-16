import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import type { ChatBlock as ChatBlockType } from '../../types';

interface Props { block: ChatBlockType }

export function ChatBlock({ block }: Props) {
  const { messages, showPhoneFrame, showContactHeader, showInputBar, showNames } = block;
  const senderColor = block.styles?.accentColor ?? '#3b82f6';
  const fontFamily = block.styles?.fontFamily;
  const fontWeight = block.styles?.fontWeight;
  const fontStyle = block.styles?.fontStyle;
  const fontSize = block.styles?.fontSize ? `${block.styles.fontSize}px` : undefined;

  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, amount: 0.1 });

  const messageList = (
    <div
      ref={containerRef}
      className="flex flex-col gap-1 p-3 overflow-y-auto flex-1"
      style={{ backgroundColor: block.styles?.backgroundColor ?? '#ffffff', fontFamily, fontWeight, fontStyle, fontSize }}
    >
      {showContactHeader && (
        <div className="text-center text-xs text-gray-400 py-2">
          {block.receiverName ?? 'Kontakt'}
        </div>
      )}
      {messages.map((msg) => (
        <motion.div
          key={msg.id}
          initial={msg.animate ? { opacity: 0, y: 8 } : false}
          animate={msg.animate ? (inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }) : undefined}
          transition={{ duration: 0.3, delay: msg.animationDelay ?? 0 }}
          className={`flex flex-col ${msg.role === 'sender' ? 'items-end' : 'items-start'}`}
        >
          {showNames && (
            <span className="text-xs text-gray-400 px-1 mb-0.5">
              {msg.role === 'sender' ? (block.senderName ?? 'Du') : (block.receiverName ?? 'Kontakt')}
            </span>
          )}
          <div
            className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
              msg.role === 'sender'
                ? 'text-white rounded-br-sm'
                : 'bg-gray-200 text-gray-900 rounded-bl-sm'
            }`}
            style={msg.role === 'sender' ? { backgroundColor: senderColor } : undefined}
          >
            {msg.text}
          </div>
        </motion.div>
      ))}
    </div>
  );

  const inputBar = showInputBar ? (
    <div className="border-t border-gray-200 bg-white px-3 py-2 flex gap-2 items-center">
      <div className="flex-1 rounded-full bg-gray-100 px-4 py-1.5 text-sm text-gray-400">
        iMessage
      </div>
    </div>
  ) : null;

  if (!showPhoneFrame) {
    return (
      <div style={{ maxWidth: block.maxWidth ?? '400px', margin: '0 auto' }}>
        <div className="flex flex-col bg-white">
          {messageList}
          {inputBar}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: block.maxWidth ?? '320px', margin: '0 auto' }}>
      <div className="rounded-[2.5rem] border-4 border-gray-800 bg-white overflow-hidden shadow-xl flex flex-col" style={{ minHeight: 480 }}>
        {block.showStatusBar && (
          <div className="bg-gray-800 text-white text-xs flex items-center justify-between px-5 py-1.5">
            <span>9:41</span>
            <span>●●●</span>
          </div>
        )}
        {messageList}
        {inputBar}
      </div>
    </div>
  );
}
