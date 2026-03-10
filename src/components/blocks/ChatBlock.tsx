import { motion } from 'framer-motion';
import type { ChatBlock as ChatBlockType, ChatMessage } from '../../types';

interface Props {
  block: ChatBlockType;
}

function Bubble({
  msg,
  senderName,
  receiverName,
  showNames,
  accentColor,
  fontSize,
  fontFamily,
}: {
  msg: ChatMessage;
  senderName?: string;
  receiverName?: string;
  showNames?: boolean;
  accentColor?: string;
  fontSize?: string;
  fontFamily?: string;
}) {
  const isSender = msg.role === 'sender';
  const Tag = msg.animate ? motion.div : 'div';
  const animProps = msg.animate
    ? {
        initial: { opacity: 0, y: 8 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.4, delay: msg.animationDelay ?? 0 },
      }
    : {};

  const name = isSender ? (senderName || 'Du') : (receiverName || 'Kontakt');

  return (
    <Tag className={`flex flex-col ${isSender ? 'items-end' : 'items-start'}`} {...animProps}>
      {showNames && (
        <span className="text-[11px] text-gray-400 mb-0.5 px-1">{name}</span>
      )}
      <div
        className={`max-w-[75%] px-4 py-2.5 text-sm leading-relaxed break-words ${
          isSender
            ? 'text-white rounded-[22px] rounded-br-[6px]'
            : 'bg-[#E5E5EA] text-gray-900 rounded-[22px] rounded-bl-[6px]'
        }`}
        style={{
          backgroundColor: isSender ? (accentColor ?? '#007AFF') : undefined,
          fontSize: fontSize ? `${fontSize}px` : undefined,
          fontFamily: fontFamily,
        }}
      >
        {msg.text || <span className="opacity-40 italic">Tomt meddelande</span>}
      </div>
    </Tag>
  );
}

export function ChatBlock({ block }: Props) {
  const showPhoneFrame = block.showPhoneFrame !== false;
  const showStatusBar = block.showStatusBar !== false;
  const showContactHeader = block.showContactHeader !== false;
  const showInputBar = block.showInputBar !== false;

  if (block.messages.length === 0) {
    return (
      <p className="text-gray-400 italic text-sm text-center py-4">Inga meddelanden ännu.</p>
    );
  }

  const inner = (
    <>
      {showStatusBar && (
        <div className="bg-white px-6 pt-3 pb-1 flex items-center justify-between">
          <span className="text-xs font-semibold">9:41</span>
          <div className="flex items-center gap-1">
            <svg width="16" height="10" viewBox="0 0 16 10" fill="currentColor" aria-hidden="true">
              <rect x="0" y="3" width="3" height="7" rx="0.5" />
              <rect x="4.5" y="2" width="3" height="8" rx="0.5" />
              <rect x="9" y="0.5" width="3" height="9.5" rx="0.5" />
              <rect x="13.5" y="0" width="2.5" height="10" rx="0.5" opacity="0.3" />
            </svg>
            <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor" aria-hidden="true">
              <path d="M7.5 2.5C9.8 2.5 11.8 3.5 13.2 5L14.5 3.7C12.7 1.9 10.2 0.8 7.5 0.8C4.8 0.8 2.3 1.9 0.5 3.7L1.8 5C3.2 3.5 5.2 2.5 7.5 2.5Z" />
              <path d="M7.5 5.5C9 5.5 10.3 6.1 11.3 7.1L12.6 5.8C11.2 4.5 9.4 3.8 7.5 3.8C5.6 3.8 3.8 4.5 2.4 5.8L3.7 7.1C4.7 6.1 6 5.5 7.5 5.5Z" />
              <circle cx="7.5" cy="9.5" r="1.5" />
            </svg>
            <svg width="25" height="12" viewBox="0 0 25 12" fill="none" aria-hidden="true">
              <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="currentColor" strokeOpacity="0.35" />
              <rect x="2" y="2" width="17" height="8" rx="2" fill="currentColor" />
              <path d="M23 4v4a2 2 0 000-4z" fill="currentColor" fillOpacity="0.4" />
            </svg>
          </div>
        </div>
      )}

      {showContactHeader && (
        <div className="bg-white px-4 pb-3 flex flex-col items-center border-b border-gray-100">
          <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-lg font-semibold text-white mb-1">
            {(block.receiverName ?? 'K').charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-semibold">{block.receiverName || 'Kontakt'}</span>
        </div>
      )}

      <div className="bg-white px-4 py-4 flex flex-col gap-2 min-h-[120px]">
        {block.messages.map((msg) => (
          <Bubble
            key={msg.id}
            msg={msg}
            senderName={block.senderName}
            receiverName={block.receiverName}
            showNames={block.showNames}
            accentColor={block.styles?.accentColor}
            fontSize={block.styles?.fontSize}
            fontFamily={block.styles?.fontFamily}
          />
        ))}
      </div>

      {showInputBar && (
        <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-2 pb-6">
          <div className="flex-1 rounded-full border border-gray-300 px-4 py-1.5 text-sm text-gray-400 bg-white">
            Meddelande
          </div>
          <div className="w-7 h-7 rounded-full bg-[#007AFF] flex items-center justify-center shrink-0">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="white" aria-hidden="true">
              <path d="M6 1v10M6 1L2 5M6 1l4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>
        </div>
      )}
    </>
  );

  const frameStyle = {
    boxShadow: block.styles?.boxShadow,
    outline: block.styles?.outlineColor
      ? `${block.styles.outlineWidth ?? '2px'} solid ${block.styles.outlineColor}`
      : undefined,
    borderRadius: block.styles?.borderRadius,
    backgroundColor: block.styles?.backgroundColor,
  };

  return (
    <div className="mx-auto max-w-sm">
      {showPhoneFrame ? (
        <div className="rounded-[40px] border border-gray-200 bg-white overflow-hidden shadow-lg" style={frameStyle}>
          {inner}
        </div>
      ) : (
        <div className="bg-white overflow-hidden" style={frameStyle}>
          {inner}
        </div>
      )}
    </div>
  );
}
