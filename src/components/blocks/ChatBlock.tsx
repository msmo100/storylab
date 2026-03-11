import { motion } from 'framer-motion';
import type { ChatBlock as ChatBlockType } from '../../types';

interface Props { block: ChatBlockType }

export function ChatBlock({ block }: Props) {
  const { messages, showPhoneFrame, showContactHeader, showInputBar } = block;
  const senderColor = block.styles?.accentColor ?? '#3b82f6';
  const fontFamily = block.styles?.fontFamily;
  const fontSize = block.styles?.fontSize ? `${block.styles.fontSize}px` : undefined;

  const inner = (
    <div className="flex flex-col gap-1 p-3 overflow-y-auto flex-1" style={{ backgroundColor: block.styles?.backgroundColor, fontFamily, fontSize }}>
      {showContactHeader && (
        <div className="text-center text-xs text-gray-400 dark:text-gray-500 py-2">
          {block.senderName ?? 'Kontakt'}
        </div>
      )}
      {messages.map((msg) => (
        <motion.div
          key={msg.id}
          initial={msg.animate ? { opacity: 0, y: 8 } : false}
          whileInView={msg.animate ? { opacity: 1, y: 0 } : undefined}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: msg.animationDelay ?? 0 }}
          className={`flex ${msg.role === 'sender' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
              msg.role === 'sender'
                ? 'text-white rounded-br-sm'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-sm'
            }`}
            style={msg.role === 'sender' ? { backgroundColor: senderColor } : undefined}
          >
            {msg.text}
          </div>
        </motion.div>
      ))}
      {showInputBar && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2 flex gap-2 items-center">
          <div className="flex-1 rounded-full bg-gray-100 dark:bg-gray-800 px-4 py-1.5 text-sm text-gray-400">
            iMessage
          </div>
        </div>
      )}
    </div>
  );

  if (!showPhoneFrame) {
    return (
      <div style={{ maxWidth: block.maxWidth ?? '400px', margin: '0 auto' }}>
        {inner}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: block.maxWidth ?? '320px', margin: '0 auto' }}>
      <div className="rounded-[2.5rem] border-4 border-gray-800 dark:border-gray-600 bg-white dark:bg-gray-900 overflow-hidden shadow-xl" style={{ minHeight: 480 }}>
        {block.showStatusBar && (
          <div className="bg-gray-800 text-white text-xs flex items-center justify-between px-5 py-1.5">
            <span>9:41</span>
            <span>●●●</span>
          </div>
        )}
        {inner}
      </div>
    </div>
  );
}
